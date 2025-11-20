export const getCategory = (distance: number): string => {
  if (distance > 1000) return 'full-tom';
  if (distance > 500) return 'middle';
  if (distance > 0) return 'sprint';
  return 'none';
};

export const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'full-tom':
      return 'Full Tom (1001+ ft)';
    case 'middle':
      return 'Middle-Distance (501-1000 ft)';
    case 'sprint':
      return 'Short Sprint (1-500 ft)';
    case 'none':
      return 'No Distance';
    default:
      return 'All Distances';
  }
};
