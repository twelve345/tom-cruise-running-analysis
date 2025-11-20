import React, { useState } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client/react';
import { GET_FILMS, GET_RUNNING_INSTANCES } from '../../graphql/queries';
import { getCategory, getCategoryLabel } from '../../utils/distanceCategories';
import type { GetFilmsResult, GetRunningInstancesResult, Film } from '../../graphql/types';

type SortField =
  | 'year'
  | 'runtimeMinutes'
  | 'totalRunningDistanceFeet'
  | 'runningInstancesCount'
  | 'cpiScore'
  | 'rottenTomatoesScore';
type SortOrder = 'ASC' | 'DESC';

export const FilmographyExplorer: React.FC = () => {
  const [sortBy, setSortBy] = useState<SortField>('year');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { loading, error, data } = useQuery<GetFilmsResult>(GET_FILMS, {
    variables: {
      sortBy,
      sortOrder,
    },
  });

  if (loading) return <div className="text-center text-slate-400">Loading filmography...</div>;
  if (error) return <div className="text-center text-red-400">Error loading films</div>;

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
  };

  const toggleRow = (filmId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(filmId)) {
      newExpanded.delete(filmId);
    } else {
      newExpanded.add(filmId);
    }
    setExpandedRows(newExpanded);
  };

  const filteredFilms =
    data?.films.filter((film: Film) => {
      if (filterCategory === 'all') return true;
      const category = getCategory(film.totalRunningDistanceFeet);
      return category === filterCategory;
    }) || [];

  const getCategoryBadge = (distance: number) => {
    const category = getCategory(distance);
    const colors = {
      none: 'bg-slate-600 text-slate-200',
      sprint: 'bg-blue-600 text-white',
      middle: 'bg-yellow-600 text-white',
      'full-tom': 'bg-amber-600 text-white',
    };
    const label = getCategoryLabel(category);
    return (
      <span className={`text-xs px-2 py-1 rounded ${colors[category as keyof typeof colors]}`}>
        {label}
      </span>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) {
      return <span className="text-slate-600">⇅</span>;
    }
    return <span className="text-amber-400">{sortOrder === 'ASC' ? '↑' : '↓'}</span>;
  };

  return (
    <section id="filmography" className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">Complete Filmography</h2>
        <p className="text-center text-slate-400 mb-6">
          Every Tom Cruise film with running analytics. Click any row to expand for details.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-center">
        <label className="text-slate-300">
          Filter by Category:
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="ml-2 bg-slate-800 text-white border border-slate-700 rounded px-3 py-2"
          >
            <option value="all">All Films ({data?.films.length || 0})</option>
            <option value="full-tom">Full Tom (1001+ ft)</option>
            <option value="middle">Middle-Distance (501-1000 ft)</option>
            <option value="sprint">Short Sprint (1-500 ft)</option>
            <option value="none">No Run (0 ft)</option>
          </select>
        </label>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('year')}
                    className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                  >
                    TITLE / YEAR <SortIcon field="year" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                  <button
                    onClick={() => handleSort('runtimeMinutes')}
                    className="flex items-center gap-2 ml-auto hover:text-amber-400 transition-colors"
                  >
                    RUNTIME <SortIcon field="runtimeMinutes" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('totalRunningDistanceFeet')}
                    className="flex items-center gap-2 ml-auto hover:text-amber-400 transition-colors"
                  >
                    DISTANCE <SortIcon field="totalRunningDistanceFeet" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                  <button
                    onClick={() => handleSort('totalRunningDistanceFeet')}
                    className="flex items-center gap-2 mx-auto hover:text-amber-400 transition-colors"
                  >
                    CATEGORY <SortIcon field="totalRunningDistanceFeet" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                  <button
                    onClick={() => handleSort('runningInstancesCount')}
                    className="flex items-center gap-2 ml-auto hover:text-amber-400 transition-colors"
                  >
                    INSTANCES <SortIcon field="runningInstancesCount" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('cpiScore')}
                    className="flex items-center gap-2 ml-auto hover:text-amber-400 transition-colors"
                  >
                    CPI <SortIcon field="cpiScore" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('rottenTomatoesScore')}
                    className="flex items-center gap-2 ml-auto hover:text-amber-400 transition-colors"
                  >
                    RT <SortIcon field="rottenTomatoesScore" />
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredFilms.map((film: Film, index: number) => (
                <React.Fragment key={film.id}>
                  {/* Main Row */}
                  <tr
                    onClick={() => toggleRow(String(film.id))}
                    className={`cursor-pointer hover:bg-slate-700/50 transition-colors ${
                      index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-850'
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white">{film.title}</div>
                      <div className="text-sm text-slate-400">{film.year}</div>
                    </td>
                    <td className="px-4 py-4 text-right text-slate-300 hidden md:table-cell">
                      {film.runtimeMinutes} min
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="font-semibold text-amber-400">
                        {film.totalRunningDistanceFeet.toLocaleString()} ft
                      </div>
                      <div className="text-xs text-slate-400">
                        {(film.totalRunningDistanceFeet / 5280).toFixed(2)} mi
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center hidden lg:table-cell">
                      {getCategoryBadge(film.totalRunningDistanceFeet)}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-300 hidden lg:table-cell">
                      {film.runningInstancesCount}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="font-bold text-amber-400">
                        {film.cpiScore ? film.cpiScore.toFixed(2) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="font-semibold text-blue-400">
                        {film.rottenTomatoesScore ? `${film.rottenTomatoesScore}%` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleRow(String(film.id))}
                        className="text-amber-400 hover:text-amber-300 transition-colors text-xl cursor-pointer"
                      >
                        {expandedRows.has(String(film.id)) ? '▼' : '▶'}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedRows.has(String(film.id)) && (
                    <tr className="bg-slate-900">
                      <td colSpan={8} className="px-4 py-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Poster - Left Side */}
                          {film.posterUrl && (
                            <div className="flex-shrink-0">
                              <img
                                src={film.posterUrl}
                                alt={film.title}
                                className="w-72 rounded shadow-lg"
                              />
                            </div>
                          )}

                          {/* Content - Right Side */}
                          <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Full Stats */}
                              <div className="space-y-3">
                                <h4 className="font-semibold text-white text-lg mb-3">
                                  Film Stats
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex gap-4">
                                    <span className="text-slate-400">Runtime:</span>
                                    <span className="text-white">
                                      {film.runtimeMinutes} minutes
                                    </span>
                                  </div>
                                  <div className="flex gap-4">
                                    <span className="text-slate-400">Total Run Time:</span>
                                    <span
                                      className={
                                        film.totalRunningTimeSeconds
                                          ? 'text-white'
                                          : 'text-slate-500'
                                      }
                                    >
                                      {film.totalRunningTimeSeconds
                                        ? `${(film.totalRunningTimeSeconds / 60).toFixed(1)} minutes`
                                        : 'Not available'}
                                    </span>
                                  </div>
                                  <div className="flex gap-4">
                                    <span className="text-slate-400">Running Density:</span>
                                    <span
                                      className={
                                        film.runningDensity ? 'text-white' : 'text-slate-500'
                                      }
                                    >
                                      {film.runningDensity
                                        ? `${film.runningDensity.toFixed(2)} ft/min`
                                        : 'Not available'}
                                    </span>
                                  </div>
                                  <div className="flex gap-4">
                                    <span className="text-slate-400">Running Instances:</span>
                                    <span className="text-white">{film.runningInstancesCount}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Performance Metrics */}
                              <div className="space-y-3">
                                <h4 className="font-semibold text-white text-lg mb-3">
                                  Performance
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex gap-4">
                                    <span className="text-slate-400">CPI Score:</span>
                                    <span
                                      className={
                                        film.cpiScore
                                          ? 'text-amber-400 font-bold'
                                          : 'text-slate-500'
                                      }
                                    >
                                      {film.cpiScore ? film.cpiScore.toFixed(2) : 'Not available'}
                                    </span>
                                  </div>
                                  <div className="flex gap-4">
                                    <span className="text-slate-400">RT Score:</span>
                                    <span
                                      className={
                                        film.rottenTomatoesScore
                                          ? 'text-blue-400 font-semibold'
                                          : 'text-slate-500'
                                      }
                                    >
                                      {film.rottenTomatoesScore
                                        ? `${film.rottenTomatoesScore}%`
                                        : 'Not available'}
                                    </span>
                                  </div>
                                  <div className="flex gap-4">
                                    <span className="text-slate-400">Category:</span>
                                    <span>{getCategoryBadge(film.totalRunningDistanceFeet)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Links Section */}
                            <div className="mt-6 pt-6 border-t border-slate-700">
                              <h4 className="font-semibold text-white text-lg mb-3">Links</h4>
                              <div className="space-y-2">
                                {/* IMDb Link */}
                                {film.imdbId && (
                                  <a
                                    href={`https://www.imdb.com/title/${film.imdbId}/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-amber-400 hover:text-amber-300 text-sm cursor-pointer"
                                  >
                                    View on IMDb →
                                  </a>
                                )}

                                {/* TMDB Link */}
                                {film.tmdbId && (
                                  <a
                                    href={`https://www.themoviedb.org/movie/${film.tmdbId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-amber-400 hover:text-amber-300 text-sm cursor-pointer"
                                  >
                                    View on TMDB →
                                  </a>
                                )}

                                {/* Rotten Tomatoes Link */}
                                {film.rottenTomatoesUrl && (
                                  <a
                                    href={film.rottenTomatoesUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-amber-400 hover:text-amber-300 text-sm cursor-pointer"
                                  >
                                    View on Rotten Tomatoes →
                                  </a>
                                )}

                                {/* Wikipedia Link */}
                                {film.wikipediaUrl && (
                                  <a
                                    href={film.wikipediaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-amber-400 hover:text-amber-300 text-sm cursor-pointer"
                                  >
                                    View on Wikipedia →
                                  </a>
                                )}

                                {/* YouTube Trailer Link */}
                                {film.youtubeTrailerUrl && (
                                  <a
                                    href={`https://www.youtube.com/watch?v=${film.youtubeTrailerUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-amber-400 hover:text-amber-300 text-sm cursor-pointer"
                                  >
                                    Watch Trailer on YouTube →
                                  </a>
                                )}

                                {/* Letterboxd Link */}
                                {film.letterboxdUrl && (
                                  <a
                                    href={film.letterboxdUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-amber-400 hover:text-amber-300 text-sm cursor-pointer"
                                  >
                                    View on Letterboxd →
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Running Instances */}
                        {film.runningInstancesCount > 0 && (
                          <RunningInstancesSection filmId={film.id} />
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFilms.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No films match the selected filter.
          </div>
        )}
      </div>

      <div className="text-center text-slate-400 text-sm">
        Showing {filteredFilms.length} of {data?.films.length || 0} films
      </div>
    </section>
  );
};

/**
 * Running Instances Section Component
 * Fetches and displays running instances for a specific film
 */
interface RunningInstancesSectionProps {
  filmId: number;
}

const RunningInstancesSection: React.FC<RunningInstancesSectionProps> = ({ filmId }) => {
  const [getRunningInstances, { loading, data, error }] =
    useLazyQuery<GetRunningInstancesResult>(GET_RUNNING_INSTANCES);

  // Fetch instances on mount
  React.useEffect(() => {
    if (filmId) {
      getRunningInstances({ variables: { filmId, limit: 100 } });
    }
  }, [filmId, getRunningInstances]);

  if (loading) {
    return (
      <div className="mt-6 pt-6 border-t border-slate-700">
        <p className="text-slate-400 text-sm italic">Loading running sequences...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 pt-6 border-t border-slate-700">
        <p className="text-red-400 text-sm">Error loading running sequences: {error.message}</p>
      </div>
    );
  }

  if (!data?.runningInstances || data.runningInstances.length === 0) {
    return (
      <div className="mt-6 pt-6 border-t border-slate-700">
        <h4 className="font-semibold text-white text-lg mb-3">Running Sequences</h4>
        <p className="text-slate-400 text-sm italic">No detailed sequence data available yet.</p>
      </div>
    );
  }

  const instances = data.runningInstances;

  return (
    <div className="mt-6 pt-6 border-t border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-white text-lg">Running Sequences ({instances.length})</h4>
        <p className="text-xs text-slate-500">Data: Mark Hobin (Movies Films & Flix)</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {instances.map((instance) => (
          <div
            key={instance.id}
            className="bg-slate-800 rounded p-2 border border-slate-700 hover:border-slate-600 transition-colors w-auto"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                    #{instance.rank}
                  </span>
                  {instance.scene.intensity && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        instance.scene.intensity === 'sprint'
                          ? 'bg-red-900/30 text-red-400'
                          : instance.scene.intensity === 'pursuit'
                            ? 'bg-orange-900/30 text-orange-400'
                            : 'bg-blue-900/30 text-blue-400'
                      }`}
                    >
                      {instance.scene.intensity}
                    </span>
                  )}
                  {instance.scene.timestampStart && (
                    <span className="text-xs text-slate-500">{instance.scene.timestampStart}</span>
                  )}
                </div>

                <p className="text-slate-300 text-sm leading-relaxed">{instance.scene.context}</p>

                {instance.scene.location &&
                  (instance.scene.location.city || instance.scene.location.setting) && (
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {instance.scene.location.city && instance.scene.location.country
                        ? `${instance.scene.location.city}, ${instance.scene.location.country}`
                        : instance.scene.location.setting}
                    </div>
                  )}
              </div>

              {instance.measurement?.distanceFeet && (
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-semibold text-amber-400">
                    {instance.measurement.distanceFeet.toLocaleString()} ft
                  </div>
                  {instance.measurement.durationSeconds && (
                    <div className="text-xs text-slate-400">
                      {instance.measurement.durationSeconds.toFixed(1)}s
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
