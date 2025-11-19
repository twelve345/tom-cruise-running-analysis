import React from 'react';
import { useQuery } from '@apollo/client/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { GET_VISUALIZATION_DATA } from '../../graphql/queries';
import { getCategory } from '../../utils/distanceCategories';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const VisualizationsSection: React.FC = () => {
  const { loading, error, data } = useQuery(GET_VISUALIZATION_DATA);

  if (loading) return <div className="text-center text-slate-400">Loading charts...</div>;
  if (error) return <div className="text-center text-red-400">Error loading charts</div>;

  // Prepare data for "Running Over Time" chart
  const runningMovies = [...data.films]
    .filter((m: any) => m.totalRunningDistanceFeet > 0)
    .sort((a: any, b: any) => a.year - b.year);

  const runningOverTimeData = {
    labels: runningMovies.map(
      (m: any) => `${m.year} - ${m.title.substring(0, 15)}${m.title.length > 15 ? '...' : ''}`
    ),
    datasets: [
      {
        label: 'Running Distance (feet)',
        data: runningMovies.map((m: any) => m.totalRunningDistanceFeet),
        backgroundColor: 'rgba(245, 158, 11, 0.6)',
        borderColor: 'rgba(251, 191, 36, 1)',
        borderWidth: 1,
      },
    ],
  };

  const runningOverTimeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
      x: {
        ticks: {
          color: '#94a3b8',
          maxRotation: 90,
          minRotation: 70,
          autoSkip: true,
          maxTicksLimit: 20,
        },
        grid: { color: '#334155' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            const movie = runningMovies[context[0].dataIndex];
            return `${movie.title} (${movie.year})`;
          },
        },
      },
    },
  };

  // Prepare data for "Run vs Ratings" chart
  const ratingData: Record<string, number[]> = {
    'No Run (0 ft)': [],
    'Short Sprint (1-500 ft)': [],
    'Middle-Distance (501-1000 ft)': [],
    'Full Tom (1001+ ft)': [],
  };

  data.films.forEach((movie: any) => {
    const category = getCategory(movie.totalRunningDistanceFeet);
    let label = '';
    if (category === 'none') label = 'No Run (0 ft)';
    else if (category === 'sprint') label = 'Short Sprint (1-500 ft)';
    else if (category === 'middle') label = 'Middle-Distance (501-1000 ft)';
    else if (category === 'full-tom') label = 'Full Tom (1001+ ft)';

    if (label && movie.rottenTomatoesScore !== null) {
      ratingData[label].push(movie.rottenTomatoesScore);
    }
  });

  const avgScores = Object.keys(ratingData).map((key) => {
    const scores = ratingData[key];
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  });

  const ratingsChartData = {
    labels: Object.keys(ratingData),
    datasets: [
      {
        label: 'Average Tomatometer Score',
        data: avgScores,
        backgroundColor: [
          'rgba(100, 116, 139, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(234, 179, 8, 0.6)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgba(100, 116, 139, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(251, 191, 36, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const ratingsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
      y: {
        ticks: { color: '#cbd5e1', font: { size: 14 } },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <section id="visualizations" className="space-y-16">
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          Running Through the Years
        </h2>
        <p className="text-center text-slate-400 mb-6">
          As Tom Cruise gets older, he runs more. This chart visualizes the running distance in his
          films over time, showing a clear upward trend in recent decades.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg h-[400px]">
          <Bar data={runningOverTimeData} options={runningOverTimeOptions} />
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          Does More Running Equal Better Movies?
        </h2>
        <p className="text-center text-slate-400 mb-6">
          Analysis by Rotten Tomatoes suggests a strong correlation. Films where Cruise runs over
          1,000 feet have significantly higher average Tomatometer scores.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg h-[450px]">
          <Bar data={ratingsChartData} options={ratingsChartOptions} />
        </div>
      </div>
    </section>
  );
};
