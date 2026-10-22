import React from 'react';
import { AxisBottom, AxisLeft, AxisRight } from '@visx/axis';
import type { ScaleLinear, ScaleBand, ScalePoint } from 'd3-scale';
import { axisStyles } from './chartTheme';

interface AxisProps {
  scale: ScaleLinear<number, number> | ScaleBand<string> | ScalePoint<string>;
  label?: string;
  top?: number;
  left?: number;
  hideAxisLine?: boolean;
  hideTicks?: boolean;
  numTicks?: number;
  /** Bottom axis only: horizontal room each tick label needs (default 80px). */
  minTickSpacing?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tickFormat?: (value: any) => string;
}

// Bottom-axis labels need roughly this much horizontal room each, unless a chart says more.
const MIN_TICK_SPACING = 80;

/**
 * Ticks that fit the axis's pixel width, so labels don't overlap on narrow screens.
 * Linear scales get a capped tick count (10 is visx's default). Band and point scales get
 * explicit tick values: visx's own thinning steps by Math.round((n - 1) / numTicks), which
 * shows every label whenever that rounds to 1.
 */
const fitTicks = (scale: AxisProps['scale'], numTicks = 10, spacing = MIN_TICK_SPACING) => {
  const [start, end] = scale.range();
  const budget = Math.max(2, Math.min(numTicks, Math.floor(Math.abs(end - start) / spacing)));
  if ('bandwidth' in scale) {
    const domain = scale.domain();
    const step = Math.ceil(domain.length / budget);
    return { tickValues: domain.filter((_, i) => i % step === 0) };
  }
  return { numTicks: budget };
};

export const DarkAxisBottom: React.FC<AxisProps> = ({
  scale,
  label,
  top,
  left,
  hideAxisLine = false,
  hideTicks = false,
  numTicks,
  minTickSpacing,
  tickFormat,
}) => (
  <AxisBottom
    top={top}
    left={left}
    scale={scale}
    label={label}
    stroke={axisStyles.bottom.axisLine.stroke}
    strokeWidth={axisStyles.bottom.axisLine.strokeWidth}
    tickStroke={axisStyles.bottom.tickLine.stroke}
    tickLabelProps={() => axisStyles.bottom.tickLabel}
    labelProps={axisStyles.bottom.label}
    hideAxisLine={hideAxisLine}
    hideTicks={hideTicks}
    {...fitTicks(scale, numTicks, minTickSpacing)}
    tickFormat={tickFormat}
  />
);

export const DarkAxisLeft: React.FC<AxisProps> = ({
  scale,
  label,
  top,
  left,
  hideAxisLine = true,
  hideTicks = true,
  numTicks,
  tickFormat,
}) => (
  <AxisLeft
    top={top}
    left={left}
    scale={scale}
    label={label}
    stroke={axisStyles.left.axisLine.stroke}
    strokeWidth={axisStyles.left.axisLine.strokeWidth}
    tickStroke={axisStyles.left.tickLine.stroke}
    tickLabelProps={() => axisStyles.left.tickLabel}
    labelProps={axisStyles.left.label}
    hideAxisLine={hideAxisLine}
    hideTicks={hideTicks}
    numTicks={numTicks}
    tickFormat={tickFormat}
  />
);

export const DarkAxisRight: React.FC<AxisProps> = ({
  scale,
  label,
  top,
  left,
  hideAxisLine = true,
  hideTicks = true,
  numTicks,
  tickFormat,
}) => (
  <AxisRight
    top={top}
    left={left}
    scale={scale}
    label={label}
    stroke={axisStyles.left.axisLine.stroke}
    strokeWidth={axisStyles.left.axisLine.strokeWidth}
    tickStroke={axisStyles.left.tickLine.stroke}
    tickLabelProps={() => ({
      ...axisStyles.left.tickLabel,
      textAnchor: 'start',
      dx: 4,
    })}
    labelProps={axisStyles.left.label}
    hideAxisLine={hideAxisLine}
    hideTicks={hideTicks}
    numTicks={numTicks}
    tickFormat={tickFormat}
  />
);
