import React from 'react';
import { AxisBottom, AxisLeft } from '@visx/axis';
import type { ScaleLinear, ScaleBand } from 'd3-scale';
import { axisStyles } from './chartTheme';

interface AxisProps {
  scale: ScaleLinear<number, number> | ScaleBand<string>;
  label?: string;
  top?: number;
  left?: number;
  hideAxisLine?: boolean;
  hideTicks?: boolean;
  numTicks?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tickFormat?: (value: any) => string;
}

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
    numTicks={numTicks}
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
