import React from 'react';
import { useQuery } from '@apollo/client/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Scatter, Doughnut } from 'react-chartjs-2';
import {
  GET_VISUALIZATION_DATA,
  GET_TOP_RUNNING_FILMS,
  GET_TOP_CPI_FILMS,
} from '../../graphql/queries';
import { getCategory } from '../../utils/distanceCategories';

// Register all Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Common chart colors
const COLORS = {
  primary: 'rgba(245, 158, 11, 0.8)',
  primaryLight: 'rgba(245, 158, 11, 0.6)',
  primaryBorder: 'rgba(251, 191, 36, 1)',
  secondary: 'rgba(59, 130, 246, 0.8)',
  secondaryLight: 'rgba(59, 130, 246, 0.6)',
  tertiary: 'rgba(234, 179, 8, 0.8)',
  quaternary: 'rgba(139, 92, 246, 0.8)',
  slate: 'rgba(100, 116, 139, 0.6)',
  success: 'rgba(34, 197, 94, 0.8)',
  danger: 'rgba(239, 68, 68, 0.8)',
};

const CATEGORY_COLORS = [
  'rgba(100, 116, 139, 0.8)', // No Run
  'rgba(59, 130, 246, 0.8)', // Short Sprint
  'rgba(234, 179, 8, 0.8)', // Middle-Distance
  'rgba(245, 158, 11, 0.9)', // Full Tom
];

// Custom crosshair plugin for vertical line on hover
const crosshairPlugin = {
  id: 'crosshair',
  afterDatasetsDraw(chart: any) {
    if (chart.tooltip?._active?.length) {
      const ctx = chart.ctx;
      const activePoint = chart.tooltip._active[0];
      const x = activePoint.element.x;
      const topY = chart.scales.y.top;
      const bottomY = chart.scales.y.bottom;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.stroke();
      ctx.restore();
    }
  },
};

export const VisualizationsSection: React.FC = () => {
  // Fetch data from GraphQL
  const { loading: loadingViz, error: errorViz, data: vizData } = useQuery(GET_VISUALIZATION_DATA);
  const {
    loading: loadingTop,
    error: errorTop,
    data: topData,
  } = useQuery(GET_TOP_RUNNING_FILMS, {
    variables: { limit: 10 },
  });
  const {
    loading: loadingCpi,
    error: errorCpi,
    data: cpiData,
  } = useQuery(GET_TOP_CPI_FILMS, {
    variables: { limit: 10 },
  });

  if (loadingViz || loadingTop || loadingCpi) {
    return <div className="text-center text-slate-400">Loading charts...</div>;
  }

  if (errorViz || errorTop || errorCpi) {
    return <div className="text-center text-red-400">Error loading charts</div>;
  }

  // ========== CHART 1: Running Over Time (Original) ==========
  const runningMovies = [...vizData.films]
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
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primaryBorder,
        borderWidth: 1,
      },
    ],
  };

  const runningOverTimeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onHover: (event: any, activeElements: any[], chart: any) => {
      chart.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
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

  // ========== CHART 2: Run vs Ratings (Original) ==========
  const ratingData: Record<string, number[]> = {
    'No Run (0 ft)': [],
    'Short Sprint (1-500 ft)': [],
    'Middle-Distance (501-1000 ft)': [],
    'Full Tom (1001+ ft)': [],
  };

  vizData.films.forEach((movie: any) => {
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
        backgroundColor: CATEGORY_COLORS,
        borderColor: CATEGORY_COLORS.map((c) => c.replace('0.8', '1')),
        borderWidth: 1,
      },
    ],
  };

  const ratingsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    onHover: (event: any, activeElements: any[], chart: any) => {
      chart.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
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

  // ========== CHART 3: Top 10 Running Films Leaderboard ==========
  const topRunningData = {
    labels: topData.topRunningFilms.map(
      (f: any) => `${f.title.substring(0, 20)}${f.title.length > 20 ? '...' : ''} (${f.year})`
    ),
    datasets: [
      {
        label: 'Running Distance (feet)',
        data: topData.topRunningFilms.map((f: any) => f.totalRunningDistanceFeet),
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primaryBorder,
        borderWidth: 1,
      },
    ],
  };

  const topRunningOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    onHover: (event: any, activeElements: any[], chart: any) => {
      chart.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
      y: {
        ticks: { color: '#cbd5e1', font: { size: 12 } },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            const film = topData.topRunningFilms[context[0].dataIndex];
            return film.title;
          },
          label: function (context: any) {
            const film = topData.topRunningFilms[context.dataIndex];
            return [`Distance: ${context.parsed.x} feet`, `RT Score: ${film.rottenTomatoesScore}%`];
          },
        },
      },
    },
  };

  // ========== CHART 4: Top 10 CPI Leaderboard ==========
  const topCpiChartData = {
    labels: cpiData.topCpiFilms.map(
      (f: any) => `${f.title.substring(0, 20)}${f.title.length > 20 ? '...' : ''} (${f.year})`
    ),
    datasets: [
      {
        label: 'CPI Score',
        data: cpiData.topCpiFilms.map((f: any) => f.cpiScore),
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary.replace('0.8', '1'),
        borderWidth: 1,
      },
    ],
  };

  const topCpiOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    onHover: (event: any, activeElements: any[], chart: any) => {
      chart.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
      y: {
        ticks: { color: '#cbd5e1', font: { size: 12 } },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            const film = cpiData.topCpiFilms[context[0].dataIndex];
            return film.title;
          },
          label: function (context: any) {
            const film = cpiData.topCpiFilms[context.dataIndex];
            return [
              `CPI: ${film.cpiScore.toFixed(2)}`,
              `Distance: ${film.totalRunningDistanceFeet} feet`,
              `RT Score: ${film.rottenTomatoesScore}%`,
            ];
          },
        },
      },
    },
  };

  // ========== CHART 5: Film Category Distribution (Pie) ==========
  const categoryCounts = {
    'No Run': 0,
    'Short Sprint': 0,
    'Middle-Distance': 0,
    'Full Tom': 0,
  };

  vizData.films.forEach((movie: any) => {
    const category = getCategory(movie.totalRunningDistanceFeet);
    if (category === 'none') categoryCounts['No Run']++;
    else if (category === 'sprint') categoryCounts['Short Sprint']++;
    else if (category === 'middle') categoryCounts['Middle-Distance']++;
    else if (category === 'full-tom') categoryCounts['Full Tom']++;
  });

  const categoryPieData = {
    labels: Object.keys(categoryCounts).map(
      (key) => `${key} (${categoryCounts[key as keyof typeof categoryCounts]} films)`
    ),
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: CATEGORY_COLORS,
        borderColor: CATEGORY_COLORS.map((c) => c.replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  };

  const categoryPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onHover: (event: any, activeElements: any[], chart: any) => {
      chart.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#cbd5e1',
          font: { size: 13 },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const total = Object.values(categoryCounts).reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${percentage}%`;
          },
        },
      },
    },
  };

  // ========== CHART 6: Cumulative Career Distance (Line) ==========
  const filmsByYear = [...vizData.films].sort((a: any, b: any) => a.year - b.year);
  const cumulativeData: { year: number; distance: number }[] = [];
  let runningTotal = 0;

  filmsByYear.forEach((film: any) => {
    runningTotal += film.totalRunningDistanceFeet;
    cumulativeData.push({ year: film.year, distance: runningTotal });
  });

  const cumulativeChartData = {
    labels: cumulativeData.map((d) => d.year),
    datasets: [
      {
        label: 'Cumulative Distance (feet)',
        data: cumulativeData.map((d) => d.distance),
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryLight,
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };

  const cumulativeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onHover: (event: any, activeElements: any[], chart: any) => {
      chart.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#94a3b8',
          callback: function (value: any) {
            return value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value;
          },
        },
        grid: { color: '#334155' },
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            const year = cumulativeData[context[0].dataIndex].year;
            const film = filmsByYear.find((f: any) => f.year === year);
            return `${year} - ${film?.title || ''}`;
          },
          label: function (context: any) {
            const feet = context.parsed.y;
            const miles = (feet / 5280).toFixed(2);
            return [`Cumulative: ${feet.toLocaleString()} feet`, `Career Total: ${miles} miles`];
          },
        },
      },
    },
  };

  // ========== CHART 7: Quality vs Distance Scatter ==========
  const scatterData = vizData.films
    .filter((f: any) => f.totalRunningDistanceFeet > 0 && f.rottenTomatoesScore !== null)
    .map((f: any) => ({
      x: f.totalRunningDistanceFeet,
      y: f.rottenTomatoesScore,
      title: f.title,
      year: f.year,
    }));

  const qualityScatterData = {
    datasets: [
      {
        label: 'Films',
        data: scatterData,
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary.replace('0.8', '1'),
        pointRadius: 6,
        pointHoverRadius: 9,
      },
    ],
  };

  const qualityScatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onHover: (event: any, activeElements: any[], chart: any) => {
      chart.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Running Distance (feet)',
          color: '#cbd5e1',
          font: { size: 14 },
        },
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
      y: {
        title: {
          display: true,
          text: 'Rotten Tomatoes Score (%)',
          color: '#cbd5e1',
          font: { size: 14 },
        },
        beginAtZero: true,
        max: 100,
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            const point = context[0].raw;
            return `${point.title} (${point.year})`;
          },
          label: function (context: any) {
            return [`Distance: ${context.parsed.x} feet`, `RT Score: ${context.parsed.y}%`];
          },
        },
      },
    },
  };

  // ========== CHART 8: CPI Scatter Plot ==========
  const cpiScatterData = vizData.films
    .filter((f: any) => f.cpiScore && f.cpiScore > 0)
    .map((f: any) => ({
      x: f.totalRunningDistanceFeet,
      y: f.rottenTomatoesScore,
      cpi: f.cpiScore,
      title: f.title,
      year: f.year,
    }));

  const cpiScatterChartData = {
    datasets: [
      {
        label: 'CPI Performance',
        data: cpiScatterData,
        backgroundColor: (context: any) => {
          const cpi = context.raw?.cpi || 0;
          // Color based on CPI value - higher CPI = more amber
          if (cpi > 20) return COLORS.primary;
          if (cpi > 10) return COLORS.tertiary;
          if (cpi > 5) return COLORS.secondary;
          return COLORS.slate;
        },
        borderColor: COLORS.primaryBorder,
        pointRadius: (context: any) => {
          const cpi = context.raw?.cpi || 0;
          // Size based on CPI value
          return Math.min(Math.max(cpi / 2, 4), 12);
        },
        pointHoverRadius: 12,
      },
    ],
  };

  const cpiScatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onHover: (event: any, activeElements: any[], chart: any) => {
      chart.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Running Distance (feet)',
          color: '#cbd5e1',
          font: { size: 14 },
        },
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
      y: {
        title: {
          display: true,
          text: 'Rotten Tomatoes Score (%)',
          color: '#cbd5e1',
          font: { size: 14 },
        },
        beginAtZero: true,
        max: 100,
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            const point = context[0].raw;
            return `${point.title} (${point.year})`;
          },
          label: function (context: any) {
            const point = context.raw;
            return [
              `CPI: ${point.cpi.toFixed(2)}`,
              `Distance: ${context.parsed.x} feet`,
              `RT Score: ${context.parsed.y}%`,
            ];
          },
        },
      },
    },
  };

  // ========== CHART 9: Decade Breakdown ==========
  const decadeData: Record<string, { distance: number[]; count: number }> = {
    '1980s': { distance: [], count: 0 },
    '1990s': { distance: [], count: 0 },
    '2000s': { distance: [], count: 0 },
    '2010s': { distance: [], count: 0 },
    '2020s': { distance: [], count: 0 },
  };

  vizData.films.forEach((film: any) => {
    const decade = Math.floor(film.year / 10) * 10;
    const decadeLabel = `${decade}s`;
    if (decadeData[decadeLabel]) {
      decadeData[decadeLabel].distance.push(film.totalRunningDistanceFeet);
      decadeData[decadeLabel].count++;
    }
  });

  const decadeAverages = Object.keys(decadeData).map((decade) => {
    const distances = decadeData[decade].distance;
    const avg = distances.length > 0 ? distances.reduce((a, b) => a + b, 0) / distances.length : 0;
    return avg;
  });

  const decadeTotals = Object.keys(decadeData).map((decade) => {
    const distances = decadeData[decade].distance;
    return distances.reduce((a, b) => a + b, 0);
  });

  const decadeChartData = {
    labels: Object.keys(decadeData),
    datasets: [
      {
        label: 'Average Distance per Film',
        data: decadeAverages,
        backgroundColor: COLORS.secondaryLight,
        borderColor: COLORS.secondary.replace('0.8', '1'),
        borderWidth: 1,
      },
      {
        label: 'Total Distance',
        data: decadeTotals,
        backgroundColor: COLORS.primaryLight,
        borderColor: COLORS.primaryBorder,
        borderWidth: 1,
      },
    ],
  };

  const decadeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onHover: (event: any, activeElements: any[], chart: any) => {
      chart.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { display: false },
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: { color: '#cbd5e1' },
      },
      tooltip: {
        callbacks: {
          afterLabel: function (context: any) {
            const decade = context.label;
            return `Films: ${decadeData[decade].count}`;
          },
        },
      },
    },
  };

  // ========== CHART 10: Running Density Analysis ==========
  const densityFilms = [...vizData.films]
    .filter((f: any) => f.runningDensity && f.runningDensity > 0)
    .sort((a: any, b: any) => b.runningDensity - a.runningDensity)
    .slice(0, 15);

  const densityChartData = {
    labels: densityFilms.map(
      (f: any) => `${f.title.substring(0, 18)}${f.title.length > 18 ? '...' : ''}`
    ),
    datasets: [
      {
        label: 'Running Density (feet/minute)',
        data: densityFilms.map((f: any) => f.runningDensity),
        backgroundColor: COLORS.tertiary,
        borderColor: COLORS.tertiary.replace('0.8', '1'),
        borderWidth: 1,
      },
    ],
  };

  const densityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    onHover: (event: any, activeElements: any[], chart: any) => {
      chart.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
      y: {
        ticks: { color: '#cbd5e1', font: { size: 11 } },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            const film = densityFilms[context[0].dataIndex];
            return `${film.title} (${film.year})`;
          },
          label: function (context: any) {
            const film = densityFilms[context.dataIndex];
            return [
              `Density: ${context.parsed.x.toFixed(2)} feet/min`,
              `Total Distance: ${film.totalRunningDistanceFeet} feet`,
            ];
          },
        },
      },
    },
  };

  // ========== CHART 11: Mission: Impossible Franchise Focus ==========
  const missionFilms = [...vizData.films]
    .filter((f: any) => f.title.toLowerCase().includes('mission: impossible'))
    .sort((a: any, b: any) => a.year - b.year);

  const missionChartData = {
    labels: missionFilms.map((f: any) => {
      const shortTitle = f.title.replace('Mission: Impossible', 'M:I');
      return `${shortTitle.substring(0, 25)} (${f.year})`;
    }),
    datasets: [
      {
        label: 'Running Distance (feet)',
        data: missionFilms.map((f: any) => f.totalRunningDistanceFeet),
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primaryBorder,
        borderWidth: 2,
        tension: 0.3,
        fill: false,
        yAxisID: 'y',
      },
      {
        label: 'RT Score (%)',
        data: missionFilms.map((f: any) => f.rottenTomatoesScore),
        backgroundColor: COLORS.success,
        borderColor: COLORS.success.replace('0.8', '1'),
        borderWidth: 2,
        tension: 0.3,
        fill: false,
        yAxisID: 'y1',
      },
    ],
  };

  const missionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onHover: (event: any, activeElements: any[], chart: any) => {
      chart.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Running Distance (feet)',
          color: '#cbd5e1',
          font: { size: 12 },
        },
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Rotten Tomatoes Score (%)',
          color: '#cbd5e1',
          font: { size: 12 },
        },
        ticks: { color: '#94a3b8' },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        ticks: {
          color: '#94a3b8',
          maxRotation: 45,
          minRotation: 30,
        },
        grid: { color: '#334155' },
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: { color: '#cbd5e1' },
      },
      tooltip: {
        callbacks: {
          title: function (context: any) {
            const film = missionFilms[context[0].dataIndex];
            return film.title;
          },
          label: function (context: any) {
            const film = missionFilms[context.dataIndex];
            if (context.datasetIndex === 0) {
              return `Distance: ${context.parsed.y.toLocaleString()} feet`;
            } else {
              return `RT Score: ${context.parsed.y}%`;
            }
          },
        },
      },
    },
  };

  return (
    <section id="visualizations" className="space-y-16">
      {/* Original Chart 1 */}
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

      {/* Original Chart 2 */}
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

      {/* New Chart 3: Top Running Films */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          Top 10 Running Performances
        </h2>
        <p className="text-center text-slate-400 mb-6">
          The films where Tom Cruise ran the most. Mission: Impossible franchise dominates the
          leaderboard.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg h-[500px]">
          <Bar data={topRunningData} options={topRunningOptions} />
        </div>
      </div>

      {/* New Chart 4: Top CPI Films */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          Cruise Performance Index (CPI) Leaderboard
        </h2>
        <p className="text-center text-slate-400 mb-6">
          CPI combines running distance with film quality. The formula: (Distance ÷ Runtime) × (RT
          Score ÷ 100). These are Tom's most complete performances.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg h-[500px]">
          <Bar data={topCpiChartData} options={topCpiOptions} />
        </div>
      </div>

      {/* New Chart 5: Category Distribution */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          Filmography Breakdown by Running Category
        </h2>
        <p className="text-center text-slate-400 mb-6">
          Distribution of Tom's {vizData.films.length} films across running categories.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg h-[450px]">
          <Doughnut data={categoryPieData} options={categoryPieOptions} />
        </div>
      </div>

      {/* New Chart 6: Cumulative Distance */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          Tom's Running Career Journey
        </h2>
        <p className="text-center text-slate-400 mb-6">
          Cumulative running distance over his entire career. From zero to over{' '}
          {(runningTotal / 5280).toFixed(1)} miles.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg h-[450px]">
          <Line
            data={cumulativeChartData}
            options={cumulativeOptions}
            plugins={[crosshairPlugin]}
          />
        </div>
      </div>

      {/* New Chart 7: Quality vs Distance Scatter */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          The Sweet Spot: Quality vs Running Distance
        </h2>
        <p className="text-center text-slate-400 mb-6">
          Each dot represents a film. Notice the cluster of high-quality, high-distance films in the
          top-right.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg h-[500px]">
          <Scatter data={qualityScatterData} options={qualityScatterOptions} />
        </div>
      </div>

      {/* New Chart 8: CPI Scatter */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">CPI Performance Map</h2>
        <p className="text-center text-slate-400 mb-6">
          Bubble size and color indicate CPI score. Larger, brighter bubbles = peak Tom Cruise
          performances.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg h-[500px]">
          <Scatter data={cpiScatterChartData} options={cpiScatterOptions} />
        </div>
      </div>

      {/* New Chart 9: Decade Breakdown */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">Evolution Across Decades</h2>
        <p className="text-center text-slate-400 mb-6">
          Tom's running has evolved dramatically from the 1980s to 2020s. The Mission: Impossible
          era changed everything.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg h-[450px]">
          <Bar data={decadeChartData} options={decadeOptions} />
        </div>
      </div>

      {/* New Chart 10: Running Density */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          Most Sprint-Intensive Films
        </h2>
        <p className="text-center text-slate-400 mb-6">
          Running density measures feet per minute. These films pack the most running into their
          runtime.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg h-[550px]">
          <Bar data={densityChartData} options={densityOptions} />
        </div>
      </div>

      {/* New Chart 11: Mission Impossible Franchise */}
      {missionFilms.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold text-center mb-2 text-white">
            Mission: Impossible Franchise Analysis
          </h2>
          <p className="text-center text-slate-400 mb-6">
            The franchise that defined modern Tom Cruise. Watch how both running distance and
            quality have progressed across {missionFilms.length} films.
          </p>
          <div className="bg-slate-800 p-4 rounded-lg shadow-lg h-[450px]">
            <Line data={missionChartData} options={missionOptions} />
          </div>
        </div>
      )}
    </section>
  );
};
