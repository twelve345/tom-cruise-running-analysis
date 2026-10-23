import { useMemo } from 'react';
import type { FilterState } from '../../../types/filters';
import { matchesFilters } from '../../../utils/filmFilters';

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
    return films.filter((film) => matchesFilters(film, filters));
  }, [films, filters]);
};
