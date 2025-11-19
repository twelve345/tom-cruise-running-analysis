import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_FILMS } from '../../graphql/queries';
import { getCategory } from '../../utils/distanceCategories';

export const FilmographyExplorer: React.FC = () => {
  const [sortBy, setSortBy] = useState<'year' | 'totalRunningDistanceFeet'>('year');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const { loading, error, data } = useQuery(GET_FILMS, {
    variables: {
      sortBy: sortBy === 'year' ? 'year' : 'totalRunningDistanceFeet',
      sortOrder: 'DESC',
      limit: 100,
    },
  });

  if (loading) return <div className="text-center text-slate-400">Loading films...</div>;
  if (error) return <div className="text-center text-red-400">Error loading films</div>;

  let films = [...data.films];

  // Client-side filtering for category since backend filter is by numeric range
  if (filterCategory !== 'all') {
    films = films.filter((film) => getCategory(film.totalRunningDistanceFeet) === filterCategory);
  }

  return (
    <section id="filmography" className="mb-12">
      <h2 className="text-3xl font-bold text-center mb-2 text-white">Filmography Explorer</h2>
      <p className="text-center text-slate-400 mb-6">
        Sort through the movies where Tom runs, or filter by the intensity of the sprint.
      </p>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-slate-300">Sort By:</span>
          <button
            onClick={() => setSortBy('year')}
            className={`nav-button py-2 px-4 rounded-md transition-all ${sortBy === 'year' ? 'bg-amber-500 text-slate-900 font-semibold' : 'bg-slate-700 text-white hover:bg-amber-500/50'}`}
          >
            Year
          </button>
          <button
            onClick={() => setSortBy('totalRunningDistanceFeet')}
            className={`nav-button py-2 px-4 rounded-md transition-all ${sortBy === 'totalRunningDistanceFeet' ? 'bg-amber-500 text-slate-900 font-semibold' : 'bg-slate-700 text-white hover:bg-amber-500/50'}`}
          >
            Distance
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-300">Filter By:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="nav-button bg-slate-700 hover:bg-amber-500/50 text-white py-2 px-4 rounded-md appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Distances</option>
            <option value="full-tom">Full Tom (1001+ ft)</option>
            <option value="middle">Middle-Distance (501-1000 ft)</option>
            <option value="sprint">Short Sprint (1-500 ft)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {films.map(
          (film: any) =>
            film.totalRunningDistanceFeet > 0 && (
              <div
                key={film.id}
                className="movie-card bg-slate-800 p-4 rounded-lg shadow-md flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
              >
                <div>
                  <h3 className="font-bold text-lg text-white">{film.title}</h3>
                  <p className="text-sm text-slate-400">{film.year}</p>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-semibold text-amber-400">
                    {film.totalRunningDistanceFeet.toLocaleString()} ft
                  </p>
                  <p className="text-xs text-slate-500">Tomatometer: {film.rottenTomatoesScore}%</p>
                </div>
              </div>
            )
        )}
      </div>
    </section>
  );
};
