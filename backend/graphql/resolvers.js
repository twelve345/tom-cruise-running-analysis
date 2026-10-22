/**
 * GraphQL Resolvers - MongoDB
 *
 * Collections:
 * - films: film documents keyed by an integer `id` (derived stats stored, see db/filmStats.js)
 * - runninginstances: running scenes, linked to films by `filmId`
 * - filmmetadata: trivia and running analysis, linked to films by `filmId`
 */

const { getMongoDB } = require('../db/mongodb');
const { ObjectId } = require('mongodb');
const { deriveFilmStats, round } = require('../db/filmStats');

const SORT_FIELDS = {
  year: 'year',
  title: 'title',
  runtimeMinutes: 'runtimeMinutes',
  totalRunningDistanceFeet: 'totalRunningDistanceFeet',
  cpiScore: 'cpiScore',
  rottenTomatoesScore: 'rottenTomatoesScore',
};

const MANUAL_SOURCE = { provider: 'Manual entry' };

// Manually created running instances get ranks from here up, clear of the source ranking
// (1-300) that db/sync.js upserts by rank on every deploy.
const MANUAL_RANK_START = 10000;

const resolvers = {
  // ============================================================================
  // QUERY RESOLVERS
  // ============================================================================

  // Film Queries
  films: async ({ filter, sortBy = 'year', sortOrder = 'DESC', limit = 100, offset = 0 }) => {
    const db = getMongoDB();
    const [docs, counts] = await Promise.all([
      db.collection('films').find(filmFilterQuery(filter)).sort({ id: 1 }).toArray(),
      instanceCountsByFilm(db),
    ]);

    const direction = sortOrder === 'ASC' ? 1 : -1;
    if (sortBy === 'runningInstancesCount') {
      docs.sort((a, b) => direction * ((counts.get(a.id) || 0) - (counts.get(b.id) || 0)));
    } else {
      const field = SORT_FIELDS[sortBy] || 'year';
      docs.sort((a, b) => compareForSort(a[field], b[field], direction));
    }

    return docs.slice(offset, offset + limit).map((doc) => mapFilm(doc, counts));
  },

  film: async ({ id }) => {
    const doc = await findFilm(id);
    return doc ? mapFilm(doc) : null;
  },

  filmByTitle: async ({ title }) => {
    const doc = await getMongoDB()
      .collection('films')
      .findOne({ title }, { collation: { locale: 'en', strength: 2 } });
    return doc ? mapFilm(doc) : null;
  },

  // Statistics Queries
  filmStats: async () => {
    const [stats] = await getMongoDB()
      .collection('films')
      .aggregate([
        {
          $group: {
            _id: null,
            totalFilms: { $sum: 1 },
            totalDistanceFeet: { $sum: '$totalRunningDistanceFeet' },
            totalRunningTimeSeconds: { $sum: '$totalRunningTimeSeconds' },
            averageDistancePerFilm: { $avg: '$totalRunningDistanceFeet' },
          },
        },
      ])
      .toArray();

    const totalDistanceFeet = stats?.totalDistanceFeet || 0;
    return {
      totalFilms: stats?.totalFilms || 0,
      totalDistanceFeet,
      totalRunningTimeSeconds: round(stats?.totalRunningTimeSeconds || 0, 2),
      averageDistancePerFilm: stats?.averageDistancePerFilm || 0,
      careerMiles: totalDistanceFeet / 5280,
    };
  },

  yearlyStats: async () => {
    const rows = await getMongoDB()
      .collection('films')
      .aggregate([
        {
          $group: {
            _id: '$year',
            totalDistanceFeet: { $sum: '$totalRunningDistanceFeet' },
            filmCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    return rows.map((row) => ({
      year: row._id,
      totalDistanceFeet: row.totalDistanceFeet || 0,
      filmCount: row.filmCount,
      films: async () => {
        const docs = await getMongoDB()
          .collection('films')
          .find({ year: row._id })
          .sort({ id: 1 })
          .toArray();
        return docs.map((doc) => mapFilm(doc));
      },
    }));
  },

  topRunningFilms: async ({ limit = 10 }) => {
    const docs = await getMongoDB()
      .collection('films')
      .find({ totalRunningDistanceFeet: { $gt: 0 } })
      .sort({ totalRunningDistanceFeet: -1, id: 1 })
      .limit(limit)
      .toArray();
    return docs.map((doc) => mapFilm(doc));
  },

  topCpiFilms: async ({ limit = 10 }) => {
    const docs = await getMongoDB()
      .collection('films')
      .find({ cpiScore: { $ne: null } })
      .sort({ cpiScore: -1, id: 1 })
      .limit(limit)
      .toArray();
    return docs.map((doc) => mapFilm(doc));
  },

  // Running Instances
  runningInstances: async ({ filmId, intensity, tags, limit = 100, offset = 0 }) => {
    const db = getMongoDB();
    const query = {};

    if (filmId) query.filmId = filmId;
    if (intensity) query['scene.intensity'] = intensity;
    if (tags && tags.length > 0) query.tags = { $in: tags };

    const instances = await db
      .collection('runninginstances')
      .find(query)
      .sort({ rank: 1 })
      .limit(limit)
      .skip(offset)
      .toArray();

    return instances.map(mapMongoRunningInstance);
  },

  runningInstance: async ({ id }) => {
    const db = getMongoDB();
    const instance = await db.collection('runninginstances').findOne({ _id: new ObjectId(id) });
    return instance ? mapMongoRunningInstance(instance) : null;
  },

  runningInstanceByRank: async ({ rank }) => {
    const db = getMongoDB();
    const instance = await db.collection('runninginstances').findOne({ rank });
    return instance ? mapMongoRunningInstance(instance) : null;
  },

  searchRunningScenes: async ({ query }) => {
    const db = getMongoDB();
    const instances = await db
      .collection('runninginstances')
      .find({ $text: { $search: query } })
      .limit(50)
      .toArray();
    return instances.map(mapMongoRunningInstance);
  },

  // Film Metadata
  filmMetadata: async ({ filmId }) => {
    const db = getMongoDB();
    const metadata = await db.collection('filmmetadata').findOne({ filmId });
    return metadata ? mapMongoFilmMetadata(metadata) : null;
  },

  allFilmMetadata: async () => {
    const db = getMongoDB();
    const metadata = await db.collection('filmmetadata').find().toArray();
    return metadata.map(mapMongoFilmMetadata);
  },

  // Film + scenes + metadata in one call
  filmWithScenes: async ({ id }) => {
    const doc = await findFilm(id);
    if (!doc) return null;

    const db = getMongoDB();
    const [instances, metadata] = await Promise.all([
      db.collection('runninginstances').find({ filmId: doc.id }).sort({ rank: 1 }).toArray(),
      db.collection('filmmetadata').findOne({ filmId: doc.id }),
    ]);

    return {
      film: mapFilm(doc),
      instances: instances.map(mapMongoRunningInstance),
      metadata: metadata ? mapMongoFilmMetadata(metadata) : null,
    };
  },

  topFilmsByIntensity: async ({ intensity, limit = 10 }) => {
    // Films with the most instances of this intensity, most first
    const db = getMongoDB();
    const ranked = await db
      .collection('runninginstances')
      .aggregate([
        { $match: { 'scene.intensity': intensity } },
        { $group: { _id: '$filmId', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: limit },
      ])
      .toArray();

    const filmIds = ranked.map((r) => r._id);
    const docs = await db
      .collection('films')
      .find({ id: { $in: filmIds } })
      .toArray();
    const byId = new Map(docs.map((doc) => [doc.id, doc]));

    return filmIds.filter((id) => byId.has(id)).map((id) => mapFilm(byId.get(id)));
  },

  // ============================================================================
  // MUTATION RESOLVERS
  // ============================================================================

  // Film Mutations
  createFilm: async ({ title, year, runtimeMinutes, rottenTomatoesScore, posterUrl, imdbId }) => {
    const films = getMongoDB().collection('films');
    const [last] = await films
      .find({}, { projection: { id: 1 } })
      .sort({ id: -1 })
      .limit(1)
      .toArray();
    const now = new Date();

    const fields = {
      title,
      year,
      runtimeMinutes: runtimeMinutes ?? null,
      rottenTomatoesScore: rottenTomatoesScore ?? null,
      totalRunningDistanceFeet: 0,
      posterUrl: posterUrl ?? null,
      imdbId: imdbId ?? null,
    };
    const doc = {
      id: (last?.id || 0) + 1,
      ...fields,
      ...deriveFilmStats(fields),
      createdAt: now,
      updatedAt: now,
    };

    await films.insertOne(doc);
    return mapFilm(doc);
  },

  updateFilm: async ({
    id,
    title,
    year,
    runtimeMinutes,
    rottenTomatoesScore,
    posterUrl,
    imdbId,
  }) => {
    const existing = await findFilm(id);
    if (!existing) throw new Error(`Film ${id} not found`);

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (year !== undefined) updates.year = year;
    if (runtimeMinutes !== undefined) updates.runtimeMinutes = runtimeMinutes;
    if (rottenTomatoesScore !== undefined) updates.rottenTomatoesScore = rottenTomatoesScore;
    if (posterUrl !== undefined) updates.posterUrl = posterUrl;
    if (imdbId !== undefined) updates.imdbId = imdbId;

    const doc = await getMongoDB()
      .collection('films')
      .findOneAndUpdate(
        { id: existing.id },
        {
          $set: {
            ...updates,
            ...deriveFilmStats({ ...existing, ...updates }),
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );
    return mapFilm(doc);
  },

  deleteFilm: async ({ id }) => {
    const filmId = toFilmId(id);
    if (filmId === null) return false;

    const db = getMongoDB();
    const result = await db.collection('films').deleteOne({ id: filmId });
    await db.collection('runninginstances').deleteMany({ filmId });
    await db.collection('filmmetadata').deleteMany({ filmId });
    return result.deletedCount > 0;
  },

  // Running Instance Mutations
  createRunningInstance: async ({
    filmId,
    sequenceNumber,
    distanceFeet,
    durationSeconds,
    timestampStart,
    context,
    intensity,
    location,
  }) => {
    const db = getMongoDB();
    const film = await db.collection('films').findOne({ id: filmId });
    if (!film) throw new Error(`Film ${filmId} not found`);

    const instances = db.collection('runninginstances');
    const [last] = await instances
      .find({}, { projection: { rank: 1 } })
      .sort({ rank: -1 })
      .limit(1)
      .toArray();
    const now = new Date();

    const doc = {
      filmId,
      filmTitle: film.title,
      filmYear: film.year,
      rank: Math.max((last?.rank || 0) + 1, MANUAL_RANK_START),
      sequenceNumber,
      scene: {
        context: context || '',
        timestampStart: timestampStart ?? null,
        timestampEnd: null,
        intensity: intensity ?? null,
        // Always an object, like the source data, so updateRunningInstance can set location.setting.
        location: { setting: location ?? null, city: null, country: null },
      },
      measurement: { distanceFeet, durationSeconds, source: 'manual', calculatedAt: now },
      tags: [],
      sources: { ranking: MANUAL_SOURCE, description: MANUAL_SOURCE, distance: MANUAL_SOURCE },
      createdAt: now,
      updatedAt: now,
    };

    const { insertedId } = await instances.insertOne(doc);
    return mapMongoRunningInstance({ ...doc, _id: insertedId });
  },

  updateRunningInstance: async ({
    id,
    distanceFeet,
    durationSeconds,
    timestampStart,
    context,
    intensity,
    location,
  }) => {
    if (!ObjectId.isValid(id)) throw new Error(`Running instance ${id} not found`);

    const updateFields = { updatedAt: new Date() };
    if (distanceFeet !== undefined) updateFields['measurement.distanceFeet'] = distanceFeet;
    if (durationSeconds !== undefined)
      updateFields['measurement.durationSeconds'] = durationSeconds;
    if (timestampStart !== undefined) updateFields['scene.timestampStart'] = timestampStart;
    if (context !== undefined) updateFields['scene.context'] = context;
    if (intensity !== undefined) updateFields['scene.intensity'] = intensity;
    if (location !== undefined) updateFields['scene.location.setting'] = location;

    // Driver 6 returns the updated document itself (null when nothing matched).
    const doc = await getMongoDB()
      .collection('runninginstances')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateFields },
        { returnDocument: 'after' }
      );
    if (!doc) throw new Error(`Running instance ${id} not found`);
    return mapMongoRunningInstance(doc);
  },

  deleteRunningInstance: async ({ id }) => {
    if (!ObjectId.isValid(id)) return false;
    const result = await getMongoDB()
      .collection('runninginstances')
      .deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Film ids are integers; GraphQL passes them as ID strings.
function toFilmId(id) {
  const filmId = Number.parseInt(id, 10);
  return Number.isNaN(filmId) ? null : filmId;
}

async function findFilm(id) {
  const filmId = toFilmId(id);
  return filmId === null ? null : getMongoDB().collection('films').findOne({ id: filmId });
}

function filmFilterQuery(filter) {
  const query = {};
  if (!filter) return query;

  const range = (field, op, value) => {
    if (value !== null && value !== undefined) query[field] = { ...query[field], [op]: value };
  };
  range('year', '$gte', filter.minYear);
  range('year', '$lte', filter.maxYear);
  range('totalRunningDistanceFeet', '$gte', filter.minDistance);
  range('totalRunningDistanceFeet', '$lte', filter.maxDistance);
  range('cpiScore', '$gte', filter.minCpi);
  range('cpiScore', '$lte', filter.maxCpi);
  range('rottenTomatoesScore', '$gte', filter.minRottenTomatoes);
  return query;
}

// Same ordering the API had on PostgreSQL: nulls last ascending, first descending.
function compareForSort(a, b, direction) {
  const aNull = a === null || a === undefined;
  const bNull = b === null || b === undefined;
  if (aNull || bNull) {
    if (aNull && bNull) return 0;
    return (aNull ? 1 : -1) * direction;
  }
  if (a < b) return -direction;
  if (a > b) return direction;
  return 0;
}

async function instanceCountsByFilm(db) {
  const rows = await db
    .collection('runninginstances')
    .aggregate([{ $group: { _id: '$filmId', count: { $sum: 1 } } }])
    .toArray();
  return new Map(rows.map((row) => [row._id, row.count]));
}

function mapFilm(doc, instanceCounts) {
  return {
    id: doc.id,
    title: doc.title,
    year: doc.year,
    runtimeMinutes: doc.runtimeMinutes,
    rottenTomatoesScore: doc.rottenTomatoesScore,
    totalRunningDistanceFeet: doc.totalRunningDistanceFeet || 0,
    totalRunningTimeSeconds: doc.totalRunningTimeSeconds || 0,
    runningInstancesCount: instanceCounts
      ? instanceCounts.get(doc.id) || 0
      : () => getMongoDB().collection('runninginstances').countDocuments({ filmId: doc.id }),
    runningDensity: doc.runningDensity ?? null,
    cpiScore: doc.cpiScore ?? null,
    posterUrl: doc.posterUrl,
    imdbId: doc.imdbId,
    tmdbId: doc.tmdbId,
    rottenTomatoesUrl: doc.rottenTomatoesUrl,
    wikipediaUrl: doc.wikipediaUrl,
    youtubeTrailerUrl: doc.youtubeTrailerUrl,
    letterboxdUrl: doc.letterboxdUrl,
    runningInstances: async () => {
      const instances = await getMongoDB()
        .collection('runninginstances')
        .find({ filmId: doc.id })
        .sort({ rank: 1 })
        .toArray();
      return instances.map(mapMongoRunningInstance);
    },
    metadata: async () => {
      const metadata = await getMongoDB().collection('filmmetadata').findOne({ filmId: doc.id });
      return metadata ? mapMongoFilmMetadata(metadata) : null;
    },
    // Data provenance
    dataSources: () => ({
      metadata: {
        provider: 'TMDB',
        url: 'https://www.themoviedb.org',
        retrievedAt: doc.createdAt?.toISOString(),
        methodology: null,
      },
      runningDistance: {
        provider: 'Rotten Tomatoes',
        url: 'https://editorial.rottentomatoes.com/article/the-more-tom-cruise-runs-the-better-his-movies-are/',
        methodology: '14.6 feet/second (6-minute mile pace)',
      },
      poster: {
        provider: 'TMDB',
        url: 'https://www.themoviedb.org',
      },
    }),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

function mapMongoRunningInstance(doc) {
  return {
    id: doc._id.toString(),
    filmId: doc.filmId,
    filmTitle: doc.filmTitle,
    filmYear: doc.filmYear,
    rank: doc.rank,
    sequenceNumber: doc.sequenceNumber,
    scene: {
      context: doc.scene.context,
      timestampStart: doc.scene.timestampStart,
      timestampEnd: doc.scene.timestampEnd,
      intensity: doc.scene.intensity,
      location: doc.scene.location,
    },
    measurement: doc.measurement
      ? {
          distanceFeet: doc.measurement.distanceFeet,
          durationSeconds: doc.measurement.durationSeconds,
          calculatedBy: doc.measurement.calculatedBy,
          confidence: doc.measurement.confidence,
          source: doc.measurement.source,
          calculatedAt: doc.measurement.calculatedAt?.toISOString(),
        }
      : null,
    media: doc.media
      ? {
          youtubeUrl: doc.media.youtubeUrl,
          youtubeTimestamp: doc.media.youtubeTimestamp,
          clips: doc.media.clips || [],
          screenshots: doc.media.screenshots || [],
        }
      : null,
    metadata: doc.metadata
      ? {
          director: doc.metadata.director,
          cinematographer: doc.metadata.cinematographer,
          stunts: doc.metadata.stunts,
          behindTheScenes: doc.metadata.behindTheScenes,
          directorQuotes: doc.metadata.directorQuotes || [],
        }
      : null,
    tags: doc.tags || [],
    sources: doc.sources,
    film: async () => {
      const film = await getMongoDB().collection('films').findOne({ id: doc.filmId });
      return film ? mapFilm(film) : null;
    },
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

function mapMongoFilmMetadata(doc) {
  return {
    id: doc._id.toString(),
    filmId: doc.filmId,
    filmTitle: doc.filmTitle,
    filmYear: doc.filmYear,
    trivia: doc.trivia || [],
    runningAnalysis: doc.runningAnalysis || null,
    behindTheScenes: doc.behindTheScenes || [],
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

module.exports = resolvers;
