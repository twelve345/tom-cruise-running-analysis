import { useCallback } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';

/**
 * Tooltip state for one chart, plus the measurements ChartTooltip needs to render it in
 * a portal.
 *
 * Attach `containerRef` to the chart's outer <svg>. Tooltip coordinates are then
 * svg-local, which is what `localPoint` returns and what the crosshair overlays use;
 * ChartTooltip adds `containerBounds` to turn them into page coordinates. Rendering in a
 * portal keeps the tooltip from being clipped by ChartWrapper's `overflow-hidden`.
 */
export function useChartTooltip<T>() {
  const { tooltipOpen, tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip<T>();
  // Used only to measure the container. Its TooltipInPortal is not used: visx's Portal
  // creates its node during render and removes it on unmount, so React StrictMode's
  // simulated remount leaves it rendering into a detached element.
  const { containerRef, containerBounds } = useTooltipInPortal({ scroll: true });

  // Show the tooltip at the pointer, in svg-local coordinates.
  const showTooltipAt = useCallback(
    (event: MouseEvent<Element> | TouchEvent<Element>, data: T) => {
      const point = localPoint(event);
      if (!point) return;
      showTooltip({ tooltipData: data, tooltipLeft: point.x, tooltipTop: point.y });
    },
    [showTooltip]
  );

  return {
    containerRef,
    containerBounds,
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    showTooltip,
    showTooltipAt,
    hideTooltip,
  };
}
