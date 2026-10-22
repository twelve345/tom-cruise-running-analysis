import React from 'react';
import { createPortal } from 'react-dom';
import { TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import type { UseTooltipInPortal } from '@visx/tooltip';
import { colors } from './chartTheme';

interface ChartTooltipProps {
  /** The `containerBounds` from this chart's useChartTooltip(). */
  containerBounds: Pick<UseTooltipInPortal['containerBounds'], 'left' | 'top'>;
  /** Position in the chart svg's own coordinates. */
  left: number;
  top: number;
  children: React.ReactNode;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  containerBounds,
  left,
  top,
  children,
}) => {
  return createPortal(
    <TooltipWithBounds
      top={top + containerBounds.top + window.scrollY}
      left={left + containerBounds.left + window.scrollX}
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
    </TooltipWithBounds>,
    document.body
  );
};
