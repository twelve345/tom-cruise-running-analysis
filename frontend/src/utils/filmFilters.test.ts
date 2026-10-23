import { matchesFilters, withRangeBound } from './filmFilters';
import { INITIAL_FILTERS } from '../types/filters';

describe('matchesFilters', () => {
  const film = { year: 2006, totalRunningDistanceFeet: 3200, rottenTomatoesScore: 70 };

  it('matches under the initial filters', () => {
    expect(matchesFilters(film, INITIAL_FILTERS)).toBe(true);
  });

  it('rejects a different running category', () => {
    expect(matchesFilters(film, { ...INITIAL_FILTERS, category: 'Short Sprint' })).toBe(false);
  });

  it('rejects a year outside the range', () => {
    expect(matchesFilters(film, { ...INITIAL_FILTERS, yearRange: [2010, 2019] })).toBe(false);
  });

  it('applies the RT range only to scored films', () => {
    const narrowed = { ...INITIAL_FILTERS, rtScore: [80, 100] as [number, number] };
    expect(matchesFilters(film, narrowed)).toBe(false);
    expect(matchesFilters({ ...film, rottenTomatoesScore: null }, narrowed)).toBe(true);
  });
});

describe('withRangeBound', () => {
  it('sets a bound', () => {
    expect(withRangeBound([1981, 2026], 0, 2000, 1981, 2026)).toEqual([2000, 2026]);
  });

  it('clamps to the allowed range, so a half-typed "2" cannot empty the page', () => {
    expect(withRangeBound([1981, 2026], 0, 2, 1981, 2026)).toEqual([1981, 2026]);
    expect(withRangeBound([0, 100], 1, 400, 0, 100)).toEqual([0, 100]);
  });

  it('keeps min <= max', () => {
    expect(withRangeBound([1990, 2000], 0, 2010, 1981, 2026)).toEqual([2000, 2000]);
    expect(withRangeBound([60, 90], 1, 10, 0, 100)).toEqual([60, 60]);
  });
});
