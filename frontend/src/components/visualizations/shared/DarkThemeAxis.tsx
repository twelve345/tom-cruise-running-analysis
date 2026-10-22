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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tickFormat?: (value: any) => string;
}

// Bottom-axis labels need roughly this much horizontal room each.
const MIN_TICK_SPACING = 80;

/**
 * Cap the tick count by the axis's pixel width so labels don't overlap on narrow
 * screens. visx thins band/point axes by numTicks too, so this covers both scale kinds.
 * 10 is visx's default.
 */
const fitTicks = (scale: AxisProps['scale'], numTicks = 10) => {
  const [start, end] = scale.range();
  const budget = Math.floor(Math.abs(end - start) / MIN_TICK_SPACING);
  return Math.max(2, Math.min(numTicks, budget));
};

export const DarkAxisBottom: React.FC<AxisProps> = ({
  scale,
  label,
  top,
  left,
  hideAxisLine = false,
  hideTicks = false,
  numTicks,
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
    numTicks={fitTicks(scale, numTicks)}
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
