import { useCallback, useRef, useState } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import { useTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';

/** Where the chart's svg sits on the page (document coordinates). */
export interface ContainerOffset {
  left: number;
  top: number;
}

interface ShowArgs<T> {
  tooltipData: T;
  tooltipLeft: number;
  tooltipTop: number;
}

/**
 * Tooltip state for one chart, plus what ChartTooltip needs to render it in a portal.
 *
 * Attach `containerRef` to the chart's outer <svg>. Tooltip coordinates stay svg-local,
 * which is what `localPoint` returns and what the crosshair overlays use; ChartTooltip adds
 * `containerOffset` to place the tooltip on the page. The svg is measured once, when a
 * tooltip is shown (document coordinates don't change on scroll), so no chart re-renders
 * while the page scrolls. Rendering in a portal keeps the tooltip from being clipped by
 * ChartWrapper's `overflow-hidden`.
 */
export function useChartTooltip<T>() {
  const tooltip = useTooltip<T>();
  const { showTooltip: showVisxTooltip } = tooltip;
  const containerRef = useRef<SVGSVGElement>(null);
  const [containerOffset, setContainerOffset] = useState<ContainerOffset>({ left: 0, top: 0 });

  // Show the tooltip at svg-local coordinates.
  const showTooltip = useCallback(
    (args: ShowArgs<T>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect)
        setContainerOffset({ left: rect.left + window.scrollX, top: rect.top + window.scrollY });
      showVisxTooltip(args);
    },
    [showVisxTooltip]
  );

  // Show the tooltip at the pointer.
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
    containerOffset,
    tooltipOpen: tooltip.tooltipOpen,
    tooltipData: tooltip.tooltipData,
    tooltipLeft: tooltip.tooltipLeft,
    tooltipTop: tooltip.tooltipTop,
    showTooltip,
    showTooltipAt,
    hideTooltip: tooltip.hideTooltip,
  };
}
