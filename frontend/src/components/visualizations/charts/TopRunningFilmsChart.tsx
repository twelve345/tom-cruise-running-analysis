import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { ChartWrapper } from '../shared/ChartWrapper';
import { ChartTooltip } from '../shared/ChartTooltip';
import { DarkAxisBottom, DarkAxisLeft } from '../shared/DarkThemeAxis';
import { AnimatedBar } from '../shared/AnimatedBar';
import { useTooltip } from '@visx/tooltip';
import { getCategoryColor } from '../shared/chartTheme';
import { getCategory } from '../../../utils/distanceCategories';

interface FilmData {
  title: string;
  year: number;
  totalRunningDistanceFeet: number;
  rottenTomatoesScore?: number;
}

interface TopRunningFilmsChartProps {
  data: FilmData[];
}

export const TopRunningFilmsChart: React.FC<TopRunningFilmsChartProps> = ({ data }) => {
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<FilmData>();

  // Sort by distance descending and take top 10
  const sortedData = useMemo(() => {
    return [...data]
      .sort((a, b) => b.totalRunningDistanceFeet - a.totalRunningDistanceFeet)
      .slice(0, 10);
  }, [data]);

  if (!sortedData || sortedData.length === 0) return null;

  // Accessors
  const getTitle = (d: FilmData) => d.title;
  const getDistance = (d: FilmData) => d.totalRunningDistanceFeet;

  return (
    <ChartWrapper height={500}>
      {({ width, height }) => {
        const margin = { top: 20, right: 30, bottom: 50, left: 180 };
        const xMax = width - margin.left - margin.right;
        const yMax = height - margin.top - margin.bottom;

        const yScale = scaleBand<string>({
          range: [0, yMax],
          domain: sortedData.map(getTitle),
          padding: 0.2,
        });

        const xScale = scaleLinear<number>({
          range: [0, xMax],
          domain: [0, Math.max(...sortedData.map(getDistance))],
        });

        return (
          <>
            <svg width={width} height={height}>
              <Group top={margin.top} left={margin.left}>
                <DarkAxisLeft
                  scale={yScale}
                  tickFormat={(v) => {
                    const title = v as string;
                    return title.length > 25 ? `${title.substring(0, 25)}...` : title;
                  }}
                />
                <DarkAxisBottom
                  top={yMax}
                  scale={xScale}
                  numTicks={5}
                  label="Distance (feet)"
                  tickFormat={(v) => `${v}`}
                />

                {sortedData.map((d, i) => {
                  const title = getTitle(d);
                  const barWidth = xScale(getDistance(d));
                  const barHeight = yScale.bandwidth();
                  const barX = 0;
                  const barY = yScale(title);

                  return (
                    <AnimatedBar
                      key={`bar-${title}`}
                      x={barX}
                      y={barY ?? 0}
                      width={barWidth}
                      height={barHeight}
                      fill={getCategoryColor(getCategory(d.totalRunningDistanceFeet))}
                      delay={i * 50}
                      isHorizontal={true}
                      onMouseLeave={() => hideTooltip()}
                      onMouseEnter={(event) => {
                        showTooltip({
                          tooltipData: d,
                          tooltipLeft: event.clientX,
                          tooltipTop: event.clientY,
                        });
                      }}
                    />
                  );
                })}
              </Group>
            </svg>

            {tooltipOpen && tooltipData && (
              <ChartTooltip left={tooltipLeft ?? 0} top={tooltipTop ?? 0}>
                <div className="font-bold text-amber-400">
                  {tooltipData.title} ({tooltipData.year})
                </div>
                <div className="text-slate-200">
                  Distance:{' '}
                  <span className="font-mono">
                    {tooltipData.totalRunningDistanceFeet.toLocaleString()} ft
                  </span>
                </div>
                {tooltipData.rottenTomatoesScore && (
                  <div className="text-slate-300 text-xs">
                    RT Score: {tooltipData.rottenTomatoesScore}%
                  </div>
                )}
              </ChartTooltip>
            )}
          </>
        );
      }}
    </ChartWrapper>
  );
};
