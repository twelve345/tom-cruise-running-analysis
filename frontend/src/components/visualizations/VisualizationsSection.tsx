import React from 'react';
import { useQuery } from '@apollo/client/react';
import { graphql } from '../../gql';
import { getCategory } from '../../utils/distanceCategories';
import type { FilterState } from '../../types/filters';
import { INITIAL_FILTERS } from '../../types/filters';
import { useFilteredChartData } from './hooks/useFilteredChartData';

// Visx Charts
import { FilmographyBreakdownChart } from './charts/FilmographyBreakdownChart';
import { RunningOverTimeChart } from './charts/RunningOverTimeChart';
import { RunVsRatingsChart } from './charts/RunVsRatingsChart';
import { DecadeBreakdownChart } from './charts/DecadeBreakdownChart';
import { MissionImpossibleChart } from './charts/MissionImpossibleChart';
import { QualityVsDistanceChart } from './charts/QualityVsDistanceChart';
import { CPIPerformanceMap } from './charts/CPIPerformanceMap';
import { TopRunningFilmsChart } from './charts/TopRunningFilmsChart';
import { CPILeaderboardChart } from './charts/CPILeaderboardChart';
import { SprintIntensityChart } from './charts/SprintIntensityChart';
import { CumulativeDistanceChart } from './charts/CumulativeDistanceChart';

// Colocated GraphQL queries
const GetVisualizationDataDocument = graphql(`
  query GetVisualizationData {
    films(limit: 100) {
      id
      title
      year
      totalRunningDistanceFeet
      rottenTomatoesScore
      cpiScore
      runningDensity
      runtimeMinutes
    }
  }
`);

interface VisualizationsSectionProps {
  filters?: FilterState;
}

export const VisualizationsSection: React.FC<VisualizationsSectionProps> = ({
  filters = INITIAL_FILTERS,
}) => {
  // Fetch data from GraphQL
  const {
    loading: loadingViz,
    error: errorViz,
    data: vizData,
  } = useQuery(GetVisualizationDataDocument);

  // Apply filters to all data
  // Must be called unconditionally to avoid "Rendered more hooks than previous render" error
  const filteredFilms = useFilteredChartData(vizData?.films ?? [], filters);

  if (loadingViz) {
    return <div className="text-center text-slate-400">Loading charts...</div>;
  }

  if (errorViz) {
    return <div className="text-center text-red-400">Error loading charts</div>;
  }

  if (!vizData?.films) {
    return null;
  }

  // Filter matrix (visx migration plan): the category comparison (chart 2), the category
  // breakdown (chart 5) and the franchise chart (chart 11) always show every film; the
  // other charts follow the filter bar.
  const allFilms = vizData.films;

  // ========== CHART 5: Film Category Distribution (Visx) ==========
  const categoryCounts = {
    'No Run': 0,
    'Short Sprint': 0,
    'Middle-Distance': 0,
    'Full Tom': 0,
  };

  allFilms.forEach((movie) => {
    const category = getCategory(movie.totalRunningDistanceFeet);
    if (category === 'none') categoryCounts['No Run']++;
    else if (category === 'sprint') categoryCounts['Short Sprint']++;
    else if (category === 'middle') categoryCounts['Middle-Distance']++;
    else if (category === 'full-tom') categoryCounts['Full Tom']++;
  });

  const filmographyBreakdownData = Object.keys(categoryCounts).map((key) => ({
    label: key,
    count: categoryCounts[key as keyof typeof categoryCounts],
  }));

  // ========== CHART 6: Cumulative Career Distance (Visx) ==========
  // Handled by CumulativeDistanceChart component
  // We need to calculate running total for the text description
  const runningTotal = filteredFilms.reduce((acc, film) => acc + film.totalRunningDistanceFeet, 0);

  // ========== CHART 10: Running Density Analysis (Visx) ==========
  const densityFilms = [...filteredFilms]
    .filter((f) => f.runningDensity && f.runningDensity > 0)
    .sort((a, b) => (b.runningDensity ?? 0) - (a.runningDensity ?? 0))
    .slice(0, 15);

  // ========== CHART 11: Mission: Impossible Franchise Focus ==========
  const missionFilms = [...allFilms]
    .filter((f) => f.title.toLowerCase().includes('mission: impossible'))
    .sort((a, b) => a.year - b.year);

  return (
    <section id="visualizations" className="space-y-16">
      {/* Chart 1: Running Over Time */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          Running Through the Years
        </h2>
        <p className="text-center text-slate-400 mb-6">
          As Tom Cruise gets older, he runs more. This chart visualizes the running distance in his
          films over time, showing a clear upward trend in recent decades.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
          <RunningOverTimeChart data={filteredFilms} />
        </div>
      </div>

      {/* Chart 2: Run vs Ratings */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          Does More Running Equal Better Movies?
        </h2>
        <p className="text-center text-slate-400 mb-6">
          Analysis by Rotten Tomatoes suggests a strong correlation. Films where Cruise runs over
          1,000 feet have significantly higher average Tomatometer scores.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
          <RunVsRatingsChart data={allFilms} />
        </div>
      </div>

      {/* Chart 3: Top 10 Running Films */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          Top 10 Running Performances
        </h2>
        <p className="text-center text-slate-400 mb-6">
          The films where Tom Cruise ran the most. Mission: Impossible franchise dominates the
          leaderboard.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
          <TopRunningFilmsChart
            data={filteredFilms.map((f) => ({
              ...f,
              rottenTomatoesScore: f.rottenTomatoesScore ?? undefined,
            }))}
          />
        </div>
      </div>

      {/* Chart 4: Top CPI Films */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          Cruise Performance Index (CPI) Leaderboard
        </h2>
        <p className="text-center text-slate-400 mb-6">
          CPI combines running distance with film quality. The formula: (Distance ÷ Runtime) × (RT
          Score ÷ 100). These are Tom's most complete performances.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
          <CPILeaderboardChart
            data={filteredFilms.map((f) => ({
              ...f,
              cpiScore: f.cpiScore ?? undefined,
              rottenTomatoesScore: f.rottenTomatoesScore ?? undefined,
            }))}
          />
        </div>
      </div>

      {/* Chart 5: Category Distribution */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          Filmography Breakdown by Running Category
        </h2>
        <p className="text-center text-slate-400 mb-6">
          Distribution of Tom's {allFilms.length} films across running categories.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
          <FilmographyBreakdownChart data={filmographyBreakdownData} />
        </div>
      </div>

      {/* Chart 6: Cumulative Distance */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          Tom's Running Career Journey
        </h2>
        <p className="text-center text-slate-400 mb-6">
          Cumulative running distance over his entire career. From zero to over{' '}
          {(runningTotal / 5280).toFixed(1)} miles.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
          <CumulativeDistanceChart data={filteredFilms} />
        </div>
      </div>

      {/* Chart 7: Quality vs Distance Scatter */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          The Sweet Spot: Quality vs Running Distance
        </h2>
        <p className="text-center text-slate-400 mb-6">
          Each dot represents a film. Notice the cluster of high-quality, high-distance films in the
          top-right.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
          <QualityVsDistanceChart data={filteredFilms} />
        </div>
      </div>

      {/* Chart 8: CPI Scatter */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">CPI Performance Map</h2>
        <p className="text-center text-slate-400 mb-6">
          Bubble size and color indicate CPI score. Larger, brighter bubbles = peak Tom Cruise
          performances.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
          <CPIPerformanceMap data={filteredFilms} />
        </div>
      </div>

      {/* Chart 9: Decade Breakdown */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">Evolution Across Decades</h2>
        <p className="text-center text-slate-400 mb-6">
          Tom's running has evolved dramatically from the 1980s to 2020s. The Mission: Impossible
          era changed everything.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
          <DecadeBreakdownChart data={filteredFilms} />
        </div>
      </div>

      {/* Chart 10: Running Density */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          Most Sprint-Intensive Films
        </h2>
        <p className="text-center text-slate-400 mb-6">
          Running density measures feet per minute. These films pack the most running into their
          runtime.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
          <SprintIntensityChart
            data={densityFilms.map((f) => ({
              ...f,
              runningDensity: f.runningDensity ?? undefined,
            }))}
          />
        </div>
      </div>

      {/* Chart 11: Mission Impossible Franchise */}
      {missionFilms.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold text-center mb-2 text-white">
            Mission: Impossible Franchise Analysis
          </h2>
          <p className="text-center text-slate-400 mb-6">
            The franchise that defined modern Tom Cruise. Watch how both running distance and
            quality have progressed across {missionFilms.length} films.
          </p>
          <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
            <MissionImpossibleChart data={missionFilms} />
          </div>
        </div>
      )}
    </section>
  );
};
