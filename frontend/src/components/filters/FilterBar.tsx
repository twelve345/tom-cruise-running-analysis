import React from 'react';
import { type FilterState, CATEGORIES, FILM_YEAR_MIN, FILM_YEAR_MAX } from '../../types/filters';
import { withRangeBound } from '../../utils/filmFilters';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  className?: string;
}

const YEAR_PRESETS: { label: string; value: [number, number] }[] = [
  { label: 'All Time', value: [FILM_YEAR_MIN, FILM_YEAR_MAX] },
  { label: '1980s', value: [1980, 1989] },
  { label: '1990s', value: [1990, 1999] },
  { label: '2000s', value: [2000, 2009] },
  { label: '2010s', value: [2010, 2019] },
  { label: '2020s', value: [2020, 2029] },
];

const RT_PRESETS: { label: string; value: [number, number] }[] = [
  { label: 'All', value: [0, 100] },
  { label: 'Certified Fresh (75-100%)', value: [75, 100] },
  { label: 'Fresh (60-100%)', value: [60, 100] },
  { label: 'Rotten (0-59%)', value: [0, 59] },
];

/**
 * A hand-typed range bound. It applies on blur or Enter, never per keystroke, so a
 * half-typed value ("2" on the way to "2010") can't empty every chart. `onCommit` returns
 * the value actually applied (after clamping), which the field then shows.
 */
const RangeBoundInput = ({
  value,
  min,
  max,
  className,
  onCommit,
}: {
  value: number;
  min: number;
  max: number;
  className: string;
  onCommit: (n: number) => number;
}) => {
  const commit = (input: HTMLInputElement) => {
    const n = Number.parseInt(input.value, 10);
    input.value = String(Number.isNaN(n) ? value : onCommit(n));
  };
  return (
    <input
      // Remount with the new default when the applied value changes elsewhere (a preset).
      key={value}
      type="number"
      defaultValue={value}
      onBlur={(e) => commit(e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit(e.currentTarget);
      }}
      className={className}
      min={min}
      max={max}
    />
  );
};

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  className = '',
}) => {
  const [isCustomYear, setIsCustomYear] = React.useState(false);
  const [isCustomRT, setIsCustomRT] = React.useState(false);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, category: e.target.value });
  };

  // Year Logic
  const yearMatch = YEAR_PRESETS.find(
    (p) => p.value[0] === filters.yearRange[0] && p.value[1] === filters.yearRange[1]
  );
  const currentYearPreset = isCustomYear ? 'Custom' : yearMatch?.label || 'Custom';

  const handleYearPresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'Custom') {
      setIsCustomYear(true);
    } else {
      setIsCustomYear(false);
      const preset = YEAR_PRESETS.find((p) => p.label === value);
      if (preset) {
        onFilterChange({ ...filters, yearRange: preset.value });
      }
    }
  };

  const handleYearInputChange = (index: 0 | 1, n: number) => {
    setIsCustomYear(true);
    const yearRange = withRangeBound(filters.yearRange, index, n, FILM_YEAR_MIN, FILM_YEAR_MAX);
    onFilterChange({ ...filters, yearRange });
    return yearRange[index];
  };

  // RT Logic
  const rtMatch = RT_PRESETS.find(
    (p) => p.value[0] === filters.rtScore[0] && p.value[1] === filters.rtScore[1]
  );
  const currentRTPreset = isCustomRT ? 'Custom' : rtMatch?.label || 'Custom';

  const handleRTPresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'Custom') {
      setIsCustomRT(true);
    } else {
      setIsCustomRT(false);
      const preset = RT_PRESETS.find((p) => p.label === value);
      if (preset) {
        onFilterChange({ ...filters, rtScore: preset.value });
      }
    }
  };

  const handleRTInputChange = (index: 0 | 1, n: number) => {
    setIsCustomRT(true);
    const rtScore = withRangeBound(filters.rtScore, index, n, 0, 100);
    onFilterChange({ ...filters, rtScore });
    return rtScore[index];
  };

  return (
    <div
      className={`sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-4 ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-6 items-center">
          {/* Category Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Category
            </label>
            <select
              value={filters.category}
              onChange={handleCategoryChange}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none min-w-[140px]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Year Range Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Year Range
            </label>
            <div className="flex items-center gap-2">
              <select
                value={currentYearPreset}
                onChange={handleYearPresetChange}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none min-w-[120px]"
              >
                {YEAR_PRESETS.map((p) => (
                  <option key={p.label} value={p.label}>
                    {p.label}
                  </option>
                ))}
                <option value="Custom">Custom</option>
              </select>

              {currentYearPreset === 'Custom' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                  <RangeBoundInput
                    value={filters.yearRange[0]}
                    onCommit={(n) => handleYearInputChange(0, n)}
                    className="w-20 bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    min={FILM_YEAR_MIN}
                    max={FILM_YEAR_MAX}
                  />
                  <span className="text-slate-500">-</span>
                  <RangeBoundInput
                    value={filters.yearRange[1]}
                    onCommit={(n) => handleYearInputChange(1, n)}
                    className="w-20 bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    min={FILM_YEAR_MIN}
                    max={FILM_YEAR_MAX}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Rotten Tomatoes Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Rotten Tomatoes
            </label>
            <div className="flex items-center gap-2">
              <select
                value={currentRTPreset}
                onChange={handleRTPresetChange}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none min-w-[160px]"
              >
                {RT_PRESETS.map((p) => (
                  <option key={p.label} value={p.label}>
                    {p.label}
                  </option>
                ))}
                <option value="Custom">Custom</option>
              </select>

              {currentRTPreset === 'Custom' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                  <RangeBoundInput
                    value={filters.rtScore[0]}
                    onCommit={(n) => handleRTInputChange(0, n)}
                    className="w-16 bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    min={0}
                    max={100}
                  />
                  <span className="text-slate-500">-</span>
                  <RangeBoundInput
                    value={filters.rtScore[1]}
                    onCommit={(n) => handleRTInputChange(1, n)}
                    className="w-16 bg-slate-800 text-slate-200 border border-slate-700 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    min={0}
                    max={100}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
