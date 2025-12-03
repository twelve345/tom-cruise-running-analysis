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
