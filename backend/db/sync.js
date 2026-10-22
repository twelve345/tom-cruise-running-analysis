/**
 * Sync MongoDB from the committed source data.
 *
 * Source files (backend/scripts/):
 * - enrichedMovieData.json      -> films
 * - extracted295instances.json  -> runninginstances
 * - filmMetadata.json           -> filmmetadata
 *
 * Idempotent: every document is upserted on a natural key (films by title+year,
 * running instances by rank, metadata by filmId) and nothing is deleted, so it is
 * safe to run on every deploy. Existing films keep their integer id; new films get
 * the next one.
 *
 * Films and metadata are refreshed from source. Running instances are inserted when
 * missing and only their film link (filmId/filmTitle/filmYear/sequenceNumber) is
 * refreshed, so edits made through updateRunningInstance survive a deploy.
 */

const { deriveFilmStats } = require('./filmStats');
const filmData = require('../scripts/enrichedMovieData.json');
const instanceData = require('../scripts/extracted295instances.json');
const metadataData = require('../scripts/filmMetadata.json');

// Source titles that differ from the film's title in enrichedMovieData.json beyond case.
const TITLE_ALIASES = {
  'mission: impossible 2': 'mission: impossible ii',
};

// Running-instance fields the sync owns; everything else is content left to the API.
const LINK_FIELDS = ['filmId', 'filmTitle', 'filmYear', 'sequenceNumber'];

function filmKey(title, year) {
  const normalized = title.trim().toLowerCase();
  return `${TITLE_ALIASES[normalized] || normalized}|${year}`;
}

function toFilmFields(source) {
  const fields = {
    title: source.title,
    year: source.year,
    runtimeMinutes: source.runtime,
    rottenTomatoesScore: source.score,
    totalRunningDistanceFeet: source.distance || 0,
    posterUrl: source.poster_url,
    imdbId: source.imdb_id,
    tmdbId: source.tmdb_id,
    rottenTomatoesUrl: source.rotten_tomatoes_url,
    wikipediaUrl: source.wikipedia_url,
    youtubeTrailerUrl: source.youtube_trailer_url,
    letterboxdUrl: source.letterboxd_url,
  };
  return { ...fields, ...deriveFilmStats(fields) };
}

async function ensureIndexes(db) {
  const films = db.collection('films');
  await films.createIndex({ id: 1 }, { unique: true });
  // Case-insensitive, matching how filmKey and filmByTitle compare titles.
  await films.createIndex(
    { title: 1, year: 1 },
    { unique: true, name: 'films_title_year_unique', collation: { locale: 'en', strength: 2 } }
  );
  await films.createIndex({ year: 1 });
  await films.createIndex({ cpiScore: -1 });

  const instances = db.collection('runninginstances');
  await instances.createIndex({ filmId: 1 });
  await instances.createIndex({ rank: 1 });
  await instances.createIndex({ filmTitle: 1, filmYear: 1 });
  // searchRunningScenes uses $text, which needs a text index.
  await instances.createIndex(
    { 'scene.context': 'text', filmTitle: 'text', tags: 'text' },
    { name: 'runninginstances_text' }
  );

  await db.collection('filmmetadata').createIndex({ filmId: 1 }, { unique: true });
}

async function syncFilms(db) {
  const films = db.collection('films');
  const existing = await films
    .find({}, { projection: { _id: 0 } })
    .sort({ id: 1 })
    .toArray();

  // First (lowest id) film wins if two stored films share a key.
  const filmsByKey = new Map();
  for (const film of existing) {
    const key = filmKey(film.title, film.year);
    if (!filmsByKey.has(key)) filmsByKey.set(key, film);
  }
  let nextId = existing.reduce((max, f) => Math.max(max, f.id), 0) + 1;
  const now = new Date();

  const ops = filmData.map((source) => {
    const key = filmKey(source.title, source.year);
    const stored = filmsByKey.get(key);
    const fields = toFilmFields(source);
    const changed =
      stored && Object.entries(fields).some(([k, v]) => (stored[k] ?? null) !== (v ?? null));

    const film = { id: stored ? stored.id : nextId++, title: source.title, year: source.year };
    filmsByKey.set(key, film);

    const update = stored
      ? { $set: changed ? { ...fields, updatedAt: now } : fields }
      : { $set: fields, $setOnInsert: { createdAt: now, updatedAt: now } };
    return { updateOne: { filter: { id: film.id }, update, upsert: true } };
  });

  const result = await films.bulkWrite(ops, { ordered: true });
  return { filmsByKey, upserted: result.upsertedCount, modified: result.modifiedCount };
}

async function syncRunningInstances(db, filmsByKey) {
  const byFilm = new Map();
  const unmatched = [];

  for (const instance of instanceData) {
    const film = filmsByKey.get(filmKey(instance.filmTitle, instance.filmYear));
    if (!film) {
      unmatched.push(`${instance.filmTitle} (${instance.filmYear})`);
      continue;
    }
    if (!byFilm.has(film.id)) byFilm.set(film.id, []);
    byFilm.get(film.id).push({ film, instance });
  }

  // Lower rank = better = sequence 1 within its film.
  const ops = [];
  for (const filmInstances of byFilm.values()) {
    filmInstances.sort((a, b) => a.instance.rank - b.instance.rank);
    filmInstances.forEach(({ film, instance }, index) => {
      // rank is the upsert filter and the link fields are $set below; the rest is content.
      const content = { ...instance };
      for (const key of ['rank', ...LINK_FIELDS]) delete content[key];
      ops.push({
        updateOne: {
          filter: { rank: instance.rank },
          update: {
            $set: {
              filmId: film.id,
              filmTitle: film.title,
              filmYear: film.year,
              sequenceNumber: index + 1,
            },
            $setOnInsert: content,
          },
          upsert: true,
        },
      });
    });
  }

  const result = ops.length
    ? await db.collection('runninginstances').bulkWrite(ops, { ordered: true })
    : null;
  return {
    count: ops.length,
    films: byFilm.size,
    upserted: result ? result.upsertedCount : 0,
    unmatched,
  };
}

async function syncFilmMetadata(db, filmsByKey) {
  const ops = [];
  for (const metadata of metadataData) {
    const film = filmsByKey.get(filmKey(metadata.filmTitle, metadata.filmYear));
    if (!film) continue;
    ops.push({
      replaceOne: {
        filter: { filmId: film.id },
        replacement: { ...metadata, filmId: film.id },
        upsert: true,
      },
    });
  }
  if (ops.length) await db.collection('filmmetadata').bulkWrite(ops, { ordered: true });
  return { count: ops.length };
}

async function syncFromSource(db) {
  await ensureIndexes(db);
  const films = await syncFilms(db);
  const instances = await syncRunningInstances(db, films.filmsByKey);
  const metadata = await syncFilmMetadata(db, films.filmsByKey);
  return {
    films: { count: films.filmsByKey.size, upserted: films.upserted, modified: films.modified },
    instances,
    metadata,
  };
}

module.exports = { syncFromSource, ensureIndexes, filmKey, toFilmFields };
