import type { FilterState } from '../types/filters';
import { getCategory, FILTER_CATEGORY_MAP } from './distanceCategories';

/** The fields the filter bar filters on. */
export interface FilterableFilm {
  year: number;
  totalRunningDistanceFeet: number;
  rottenTomatoesScore?: number | null;
}

/**
 * The filter bar's rule, shared by the charts and the filmography table so they always
 * agree: the running category must match, the year must be inside the range, and a film
 * with an RT score must be inside the score range (a film without one is kept).
 */
export const matchesFilters = (film: FilterableFilm, filters: FilterState): boolean => {
  if (
    filters.category !== 'All' &&
    getCategory(film.totalRunningDistanceFeet) !== FILTER_CATEGORY_MAP[filters.category]
  ) {
    return false;
  }

  if (film.year < filters.yearRange[0] || film.year > filters.yearRange[1]) {
    return false;
  }

  const score = film.rottenTomatoesScore;
  if (score !== null && score !== undefined) {
    if (score < filters.rtScore[0] || score > filters.rtScore[1]) {
      return false;
    }
  }

  return true;
};

/** `range` with bound `index` set to `n`, clamped to [min, max] and kept in order. */
export const withRangeBound = (
  range: [number, number],
  index: 0 | 1,
  n: number,
  min: number,
  max: number
): [number, number] => {
  const clamped = Math.min(max, Math.max(min, n));
  return index === 0
    ? [Math.min(clamped, range[1]), range[1]]
    : [range[0], Math.max(clamped, range[0])];
};
