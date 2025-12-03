import React from 'react';
import { type FilterState, CATEGORIES } from '../../types/filters';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  className = '',
}) => {
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, category: e.target.value });
  };

  const handleYearChange = (index: 0 | 1, value: string) => {
    const newRange = [...filters.yearRange] as [number, number];
    newRange[index] = parseInt(value, 10) || 0;
    onFilterChange({ ...filters, yearRange: newRange });
  };

  const handleScoreChange = (index: 0 | 1, value: string) => {
    const newRange = [...filters.rtScore] as [number, number];
    newRange[index] = parseInt(value, 10) || 0;
    onFilterChange({ ...filters, rtScore: newRange });
  };

  return (
    <div
      className={`sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-4 ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Category
            </label>
            <select
              value={filters.category}
              onChange={handleCategoryChange}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Year Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={filters.yearRange[0]}
                onChange={(e) => handleYearChange(0, e.target.value)}
                className="w-20 bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                min={1981}
                max={2024}
              />
              <span className="text-slate-500">-</span>
              <input
                type="number"
                value={filters.yearRange[1]}
                onChange={(e) => handleYearChange(1, e.target.value)}
                className="w-20 bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                min={1981}
                max={2024}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Rotten Tomatoes
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={filters.rtScore[0]}
                onChange={(e) => handleScoreChange(0, e.target.value)}
                className="w-16 bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                min={0}
                max={100}
              />
              <span className="text-slate-500">-</span>
              <input
                type="number"
                value={filters.rtScore[1]}
                onChange={(e) => handleScoreChange(1, e.target.value)}
                className="w-16 bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                min={0}
                max={100}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
