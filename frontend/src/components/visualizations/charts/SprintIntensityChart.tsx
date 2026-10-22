import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { ChartWrapper } from '../shared/ChartWrapper';
import { ChartTooltip } from '../shared/ChartTooltip';
import { useChartTooltip } from '../shared/useChartTooltip';
import { innerSize, domainMax } from '../shared/chartLayout';
import { DarkAxisBottom, DarkAxisLeft } from '../shared/DarkThemeAxis';
import { AnimatedBar } from '../shared/AnimatedBar';
import { getCategoryColor } from '../shared/chartTheme';
import { getCategory } from '../../../utils/distanceCategories';

interface FilmData {
  id: string;
  title: string;
  year: number;
  runningDensity?: number | null;
  totalRunningDistanceFeet: number;
}

interface SprintIntensityChartProps {
  data: FilmData[];
}

export const SprintIntensityChart: React.FC<SprintIntensityChartProps> = ({ data }) => {
  const {
    containerRef,
    containerOffset,
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltipAt,
  } = useChartTooltip<FilmData>();

  // Sort by Density descending and take top 15 (as per original)
  const sortedData = useMemo(() => {
    return data
      .filter((d) => (d.runningDensity ?? 0) > 0)
      .sort((a, b) => (b.runningDensity ?? 0) - (a.runningDensity ?? 0))
      .slice(0, 15);
  }, [data]);

  if (sortedData.length === 0)
    return (
      <div className="text-center text-slate-400 py-10">
        No running data available for current filters
      </div>
    );

  // Accessors
  const getId = (d: FilmData) => d.id;
  const titleById = new Map(sortedData.map((d) => [d.id, d.title]));
  const getDensity = (d: FilmData) => d.runningDensity ?? 0;

  return (
    <ChartWrapper height={600}>
      {({ width, height }) => {
        const margin = { top: 20, right: 30, bottom: 50, left: 180 };
        const { xMax, yMax } = innerSize(width, height, margin);

        const yScale = scaleBand<string>({
          range: [0, yMax],
          domain: sortedData.map(getId),
          padding: 0.2,
        });

        const xScale = scaleLinear<number>({
          range: [0, xMax],
          domain: [0, domainMax(sortedData.map(getDensity))],
        });

        return (
          <>
            <svg ref={containerRef} width={width} height={height}>
              <Group top={margin.top} left={margin.left}>
                <DarkAxisLeft
                  scale={yScale}
                  tickFormat={(v) => {
                    const title = titleById.get(v as string) ?? (v as string);
                    return title.length > 25 ? `${title.substring(0, 25)}...` : title;
                  }}
                />
                <DarkAxisBottom
                  top={yMax}
                  scale={xScale}
                  numTicks={5}
                  label="Running Density (feet/minute)"
                  tickFormat={(v) => `${v}`}
                />

                {sortedData.map((d, i) => {
                  const id = getId(d);
                  const barWidth = xScale(getDensity(d));
                  const barHeight = yScale.bandwidth();
                  const barX = 0;
                  const barY = yScale(id);

                  return (
                    <AnimatedBar
                      key={`bar-${id}`}
                      x={barX}
                      y={barY ?? 0}
                      width={barWidth}
                      height={barHeight}
                      fill={getCategoryColor(getCategory(d.totalRunningDistanceFeet))}
                      delay={i * 50}
                      isHorizontal={true}
                      onMouseLeave={() => hideTooltip()}
                      onMouseEnter={(event) => showTooltipAt(event, d)}
                    />
                  );
                })}
              </Group>
            </svg>

            {tooltipOpen && tooltipData && (
              <ChartTooltip
                containerOffset={containerOffset}
                left={tooltipLeft ?? 0}
                top={tooltipTop ?? 0}
              >
                <div className="font-bold text-amber-400">
                  {tooltipData.title} ({tooltipData.year})
                </div>
                <div className="text-slate-200">
                  Density:{' '}
                  <span className="font-mono font-bold text-amber-300">
                    {tooltipData.runningDensity?.toFixed(2)} ft/min
                  </span>
                </div>
                <div className="text-slate-300 text-xs mt-1">
                  Total Distance: {tooltipData.totalRunningDistanceFeet.toLocaleString()} ft
                </div>
              </ChartTooltip>
            )}
          </>
        );
      }}
    </ChartWrapper>
  );
};
