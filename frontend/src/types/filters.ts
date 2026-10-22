export interface FilterState {
  category: string;
  yearRange: [number, number];
  rtScore: [number, number];
}

export const INITIAL_FILTERS: FilterState = {
  category: 'All',
  yearRange: [1981, 2025],
  rtScore: [0, 100],
};

export const CATEGORIES = ['All', 'Full Tom', 'Middle-Distance', 'Short Sprint', 'No Run'];
