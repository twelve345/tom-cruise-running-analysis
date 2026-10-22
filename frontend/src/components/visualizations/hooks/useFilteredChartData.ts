import { useMemo } from 'react';
import type { FilterState } from '../../../types/filters';
import { getCategory, FILTER_CATEGORY_MAP } from '../../../utils/distanceCategories';

// Define a minimal Film interface that covers what we need for filtering and charts
// We can expand this or import from a shared type definition if available
export interface ChartFilmData {
  id: string;
  title: string;
  year: number;
  rottenTomatoesScore?: number | null;
  totalRunningDistanceFeet: number;
  runningDensity?: number | null;
  boxOffice?: number | null;
  cpiScore?: number | null;
}

// Generic so callers keep their full film type (extra fields charts need)
export const useFilteredChartData = <T extends ChartFilmData>(films: T[], filters: FilterState) => {
  return useMemo(() => {
    return films.filter((film) => {
      // 1. Category Filter
      if (filters.category !== 'All') {
        const filmCategory = getCategory(film.totalRunningDistanceFeet);
        const targetCategory = FILTER_CATEGORY_MAP[filters.category];
        if (filmCategory !== targetCategory) {
          return false;
        }
      }

      // 2. Year Range Filter
      if (film.year < filters.yearRange[0] || film.year > filters.yearRange[1]) {
        return false;
      }

      // 3. Rotten Tomatoes Score Filter. Same rule as FilmographyExplorer: a film with a
      // score must fall inside the range; a film without one is kept.
      if (film.rottenTomatoesScore !== null && film.rottenTomatoesScore !== undefined) {
        if (
          film.rottenTomatoesScore < filters.rtScore[0] ||
          film.rottenTomatoesScore > filters.rtScore[1]
        ) {
          return false;
        }
      }

      return true;
    });
  }, [films, filters]);
};
