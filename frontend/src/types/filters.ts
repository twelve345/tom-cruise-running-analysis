export interface FilterState {
  category: string;
  yearRange: [number, number];
  rtScore: [number, number];
}

// Tom Cruise's first film is from 1981. The upper bound follows the calendar, so a new
// release is never filtered out by default.
export const FILM_YEAR_MIN = 1981;
export const FILM_YEAR_MAX = new Date().getFullYear();

export const INITIAL_FILTERS: FilterState = {
  category: 'All',
  yearRange: [FILM_YEAR_MIN, FILM_YEAR_MAX],
  rtScore: [0, 100],
};

export const CATEGORIES = ['All', 'Full Tom', 'Middle-Distance', 'Short Sprint', 'No Run'];
