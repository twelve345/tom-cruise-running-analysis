import { buildChartTheme } from '@visx/xychart';

export const colors = {
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  violet: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
};

export const chartTheme = buildChartTheme({
  backgroundColor: colors.slate[900],
  colors: [colors.amber[500], colors.amber[400], colors.amber[300]],
  gridColor: colors.slate[700],
  gridColorDark: colors.slate[800],
  tickLength: 4,
});

export const axisStyles = {
  bottom: {
    axisLine: { stroke: colors.slate[600], strokeWidth: 1 },
    tickLine: { stroke: colors.slate[600], strokeWidth: 1 },
    tickLabel: {
      fill: colors.slate[400],
      fontSize: 11,
      fontFamily: 'Inter, sans-serif',
      textAnchor: 'middle' as const,
    },
    label: {
      fill: colors.slate[300],
      fontSize: 12,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 600,
      textAnchor: 'middle' as const,
    },
  },
  left: {
    axisLine: { stroke: 'transparent', strokeWidth: 0 },
    tickLine: { stroke: 'transparent', strokeWidth: 0 },
    tickLabel: {
      fill: colors.slate[400],
      fontSize: 11,
      fontFamily: 'Inter, sans-serif',
      textAnchor: 'end' as const,
      dx: -4,
    },
    label: {
      fill: colors.slate[300],
      fontSize: 12,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 600,
      textAnchor: 'middle' as const,
    },
  },
};

export const getCategoryColor = (category: string): string => {
  // Normalize string to handle both internal keys and display labels
  const normalized = category.toLowerCase();

  if (normalized.includes('full') || normalized === 'full-tom') return '#f97316'; // Orange-500
  if (normalized.includes('middle')) return '#eab308'; // Yellow-500
  if (normalized.includes('short') || normalized.includes('sprint')) return '#3b82f6'; // Blue-500
  if (normalized.includes('no') || normalized === 'none') return colors.slate[600];

  return colors.slate[500];
};
