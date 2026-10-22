import React from 'react';
import { TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { colors } from './chartTheme';

interface ChartTooltipProps {
  left: number;
  top: number;
  children: React.ReactNode;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({ left, top, children }) => {
  return (
    <TooltipWithBounds
      top={top}
      left={left}
      style={{
        ...defaultStyles,
        backgroundColor: colors.slate[800],
        color: colors.slate[100],
        border: `1px solid ${colors.slate[600]}`,
        borderRadius: '0.5rem',
        padding: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {children}
    </TooltipWithBounds>
  );
};
