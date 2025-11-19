import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_FILM_STATS } from '../../graphql/queries';

export const StatsSection: React.FC = () => {
  const { loading, error, data } = useQuery(GET_FILM_STATS);

  if (loading) return <div className="text-center text-slate-400">Loading stats...</div>;
  if (error) return <div className="text-center text-red-400">Error loading stats</div>;

  const { totalDistanceFeet, totalRunningTimeSeconds, careerMiles } = data.filmStats;

  // Format time (seconds to mm:ss)
  const minutes = Math.floor(totalRunningTimeSeconds / 60);
  const seconds = Math.round(totalRunningTimeSeconds % 60);
  const formattedTime = `~${minutes}m ${seconds}s`;

  return (
    <section id="stats" className="mb-12 bg-slate-800 p-6 rounded-lg shadow-lg">
      <p className="text-center text-slate-300 mb-6 text-lg">
        Across his prolific career, Tom Cruise has turned running into an art form. The data shows
        not only a staggering total distance covered but also a fascinating correlation between his
        on-screen sprints and the success of his films. This interactive dashboard explores that
        very phenomenon.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
        <div className="bg-slate-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-amber-400">Total On-Screen Distance</h3>
          <p className="text-5xl font-bold text-white mt-2">
            ~{totalDistanceFeet.toLocaleString()} ft
          </p>
          <p className="text-slate-400">(~{careerMiles.toFixed(2)} miles)</p>
        </div>
        <div className="bg-slate-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-amber-400">Total On-Screen Run Time</h3>
          <p className="text-5xl font-bold text-white mt-2">{formattedTime}</p>
          <p className="text-slate-400">(in supercuts)</p>
        </div>
      </div>
    </section>
  );
};
