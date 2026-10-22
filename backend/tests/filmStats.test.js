const { deriveFilmStats, round } = require('../db/filmStats');

describe('deriveFilmStats', () => {
  it('matches the values the PostgreSQL trigger stored (Top Gun)', () => {
    expect(
      deriveFilmStats({
        totalRunningDistanceFeet: 211,
        runtimeMinutes: 110,
        rottenTomatoesScore: 58,
      })
    ).toEqual({ totalRunningTimeSeconds: 14.35, runningDensity: 1.9182, cpiScore: 1.1125 });
  });

  it('leaves density and CPI null for a film with no running distance', () => {
    expect(
      deriveFilmStats({ totalRunningDistanceFeet: 0, runtimeMinutes: 123, rottenTomatoesScore: 42 })
    ).toEqual({ totalRunningTimeSeconds: 0, runningDensity: null, cpiScore: null });
  });

  it('leaves density/CPI null when runtime or Tomatometer is missing', () => {
    expect(
      deriveFilmStats({ totalRunningDistanceFeet: 100, runtimeMinutes: 0, rottenTomatoesScore: 80 })
    ).toMatchObject({ runningDensity: null, cpiScore: null });
    expect(
      deriveFilmStats({
        totalRunningDistanceFeet: 100,
        runtimeMinutes: 100,
        rottenTomatoesScore: null,
      })
    ).toMatchObject({ runningDensity: 1, cpiScore: null });
  });
});

describe('round', () => {
  it('rounds half up without float drift', () => {
    expect(round(1.005, 2)).toBe(1.01);
    expect(round(1.11254545, 4)).toBe(1.1125);
  });
});
