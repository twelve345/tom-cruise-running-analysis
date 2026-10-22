import React from 'react';
import { createPortal } from 'react-dom';
import { TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import type { ContainerOffset } from './useChartTooltip';
import { colors } from './chartTheme';

interface ChartTooltipProps {
  /** The `containerOffset` from this chart's useChartTooltip(). */
  containerOffset: ContainerOffset;
  /** Position in the chart svg's own coordinates. */
  left: number;
  top: number;
  children: React.ReactNode;
}

/**
 * Rendered with React's createPortal into document.body. (visx's TooltipInPortal manages
 * its own portal node in a class component, which React StrictMode's simulated remount
 * leaves detached, so its tooltips never appear in development.)
 */
export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  containerOffset,
  left,
  top,
  children,
}) => {
  return createPortal(
    <TooltipWithBounds
      top={top + containerOffset.top}
      left={left + containerOffset.left}
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
