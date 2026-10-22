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

      // 3. Rotten Tomatoes Score Filter
      // If film has no score, we generally include it unless we want strict filtering.
      // However, the existing logic in FilmographyExplorer excludes them if they don't match.
      // Let's assume if it has a score, check it. If not, maybe keep it?
      // Replicating FilmographyExplorer logic:
      if (film.rottenTomatoesScore !== null && film.rottenTomatoesScore !== undefined) {
        if (
          film.rottenTomatoesScore < filters.rtScore[0] ||
          film.rottenTomatoesScore > filters.rtScore[1]
        ) {
          return false;
        }
      } else {
        // If no score, and filter is NOT default (0-100), maybe exclude?
        // Or just always include?
        // Let's stick to: if filter is 0-100, include. If user narrowed it, exclude nulls.
        const isDefaultScoreFilter = filters.rtScore[0] === 0 && filters.rtScore[1] === 100;
        if (!isDefaultScoreFilter) {
          return false;
        }
      }

      return true;
    });
  }, [films, filters]);
};
