const { filmKey, toFilmFields } = require('../db/sync');
const filmData = require('../scripts/enrichedMovieData.json');
const instanceData = require('../scripts/extracted295instances.json');
const metadataData = require('../scripts/filmMetadata.json');

describe('filmKey', () => {
  it('matches titles case-insensitively', () => {
    expect(filmKey('All The Right Moves', 1983)).toBe(filmKey('All the Right Moves', 1983));
  });

  it('maps the "Mission: Impossible 2" alias to the film title', () => {
    expect(filmKey('Mission: Impossible 2', 2000)).toBe(filmKey('Mission: Impossible II', 2000));
  });

  it('keeps the year in the key', () => {
    expect(filmKey('Top Gun', 1986)).not.toBe(filmKey('Top Gun', 2022));
  });
});

describe('source data', () => {
  const filmKeys = new Set(filmData.map((f) => filmKey(f.title, f.year)));

  it('links every running instance to a film', () => {
    const unmatched = instanceData.filter((i) => !filmKeys.has(filmKey(i.filmTitle, i.filmYear)));
    expect(unmatched.map((i) => `${i.filmTitle} (${i.filmYear})`)).toEqual([]);
  });

  it('links every metadata entry to a film', () => {
    const unmatched = metadataData.filter((m) => !filmKeys.has(filmKey(m.filmTitle, m.filmYear)));
    expect(unmatched.map((m) => `${m.filmTitle} (${m.filmYear})`)).toEqual([]);
  });

  it('has unique running instance ranks', () => {
    expect(new Set(instanceData.map((i) => i.rank)).size).toBe(instanceData.length);
  });
});

describe('toFilmFields', () => {
  it('maps source fields and stores derived stats', () => {
    const topGun = filmData.find((f) => f.title === 'Top Gun' && f.year === 1986);
    expect(toFilmFields(topGun)).toMatchObject({
      title: 'Top Gun',
      runtimeMinutes: 110,
      rottenTomatoesScore: 58,
      totalRunningDistanceFeet: 211,
      totalRunningTimeSeconds: 14.35,
      runningDensity: 1.9182,
      cpiScore: 1.1125,
      imdbId: 'tt0092099',
      tmdbId: 744,
    });
  });
});
