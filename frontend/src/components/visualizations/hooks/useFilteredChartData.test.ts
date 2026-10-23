import { renderHook } from '@testing-library/react';
import { useFilteredChartData, type ChartFilmData } from './useFilteredChartData';
import { INITIAL_FILTERS, type FilterState } from '../../../types/filters';

const film = (overrides: Partial<ChartFilmData>): ChartFilmData => ({
  id: overrides.title ?? 'film',
  title: 'film',
  year: 2000,
  totalRunningDistanceFeet: 0,
  rottenTomatoesScore: 80,
  ...overrides,
});

const FILMS: ChartFilmData[] = [
  film({ title: 'No Run', year: 1983, totalRunningDistanceFeet: 0, rottenTomatoesScore: 40 }),
  film({ title: 'Sprint', year: 1996, totalRunningDistanceFeet: 300, rottenTomatoesScore: 65 }),
  film({ title: 'Middle', year: 2006, totalRunningDistanceFeet: 800, rottenTomatoesScore: null }),
  film({ title: 'Full Tom', year: 2023, totalRunningDistanceFeet: 3200, rottenTomatoesScore: 96 }),
];

const titles = (filters: FilterState) =>
  renderHook(() => useFilteredChartData(FILMS, filters)).result.current.map((f) => f.title);

describe('useFilteredChartData', () => {
  it('keeps every film under the initial filters', () => {
    expect(titles(INITIAL_FILTERS)).toEqual(['No Run', 'Sprint', 'Middle', 'Full Tom']);
  });

  it('filters by running category', () => {
    expect(titles({ ...INITIAL_FILTERS, category: 'Full Tom' })).toEqual(['Full Tom']);
    expect(titles({ ...INITIAL_FILTERS, category: 'No Run' })).toEqual(['No Run']);
  });

  it('filters by an inclusive year range', () => {
    expect(titles({ ...INITIAL_FILTERS, yearRange: [1996, 2006] })).toEqual(['Sprint', 'Middle']);
  });

  it('applies the RT range to scored films and keeps unscored ones, like FilmographyExplorer', () => {
    expect(titles({ ...INITIAL_FILTERS, rtScore: [60, 100] })).toEqual([
      'Sprint',
      'Middle',
      'Full Tom',
    ]);
  });

  it('keeps the caller’s extra fields', () => {
    const extended = [{ ...FILMS[3], runtimeMinutes: 163 }];
    const { result } = renderHook(() => useFilteredChartData(extended, INITIAL_FILTERS));
    expect(result.current[0].runtimeMinutes).toBe(163);
  });
});
