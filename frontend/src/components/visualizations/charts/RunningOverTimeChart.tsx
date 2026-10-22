import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { ChartWrapper } from '../shared/ChartWrapper';
import { DarkAxisBottom, DarkAxisLeft } from '../shared/DarkThemeAxis';
import { AnimatedBar } from '../shared/AnimatedBar';
import { ChartTooltip } from '../shared/ChartTooltip';
import { useChartTooltip } from '../shared/useChartTooltip';
import { innerSize, domainMax } from '../shared/chartLayout';
import { getCategoryColor } from '../shared/chartTheme';
import { getCategory } from '../../../utils/distanceCategories';

interface FilmData {
  id: string;
  title: string;
  year: number;
  totalRunningDistanceFeet: number;
}

interface RunningOverTimeChartProps {
  data: FilmData[];
}

export const RunningOverTimeChart: React.FC<RunningOverTimeChartProps> = ({ data }) => {
  const {
    containerRef,
    containerBounds,
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltipAt,
  } = useChartTooltip<FilmData>();

  // Sort by year
  const sortedData = useMemo(() => {
    return [...data].filter((d) => d.totalRunningDistanceFeet > 0).sort((a, b) => a.year - b.year);
  }, [data]);

  if (!sortedData || sortedData.length === 0)
    return (
      <div className="text-center text-slate-400 py-10">
        No running data available for current filters
      </div>
    );

  // Accessors. Bars are keyed by id; the axis shows "year - title".
  const getId = (d: FilmData) => d.id;
  const labelById = new Map(sortedData.map((d) => [d.id, `${d.year} - ${d.title}`]));
  const getDistance = (d: FilmData) => d.totalRunningDistanceFeet;

  return (
    <ChartWrapper height={400}>
      {({ width, height }) => {
        const margin = { top: 20, right: 30, bottom: 100, left: 60 };
        const { xMax, yMax } = innerSize(width, height, margin);

        const xScale = scaleBand<string>({
          range: [0, xMax],
          domain: sortedData.map(getId),
          padding: 0.2,
        });

        const yScale = scaleLinear<number>({
          range: [yMax, 0],
          domain: [0, domainMax(sortedData.map(getDistance))],
          nice: true,
        });

        return (
          <>
            <svg ref={containerRef} width={width} height={height}>
              <Group top={margin.top} left={margin.left}>
                <DarkAxisBottom
                  top={yMax}
                  scale={xScale}
                  tickFormat={(v) => {
                    // Truncate long labels
                    const label = labelById.get(v) ?? v;
                    return label.length > 15 ? `${label.substring(0, 15)}...` : label;
                  }}
                  // Rotate labels for better fit
                  // Note: DarkAxisBottom doesn't expose tickLabelProps directly for rotation easily
                  // without modifying the component or passing a custom prop.
                  // But DarkAxisBottom uses axisStyles.bottom.tickLabel.
                  // We might need to adjust DarkThemeAxis to allow overriding tickLabelProps or just accept it.
                  // For now, let's see how it looks. If crowded, we might need to skip ticks or rotate.
                  // Actually, the original chart rotated ticks 90 degrees.
                  // Let's assume we might need to update DarkThemeAxis later if rotation is needed.
                />
                <DarkAxisLeft scale={yScale} label="Distance (feet)" tickFormat={(v) => `${v}`} />

                {sortedData.map((d, i) => {
                  const id = getId(d);
                  const barWidth = xScale.bandwidth();
                  const barHeight = yMax - (yScale(getDistance(d)) ?? 0);
                  const barX = xScale(id);
                  const barY = yMax - barHeight;

                  return (
                    <AnimatedBar
                      key={`bar-${id}`}
                      x={barX ?? 0}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={getCategoryColor(getCategory(d.totalRunningDistanceFeet))}
                      delay={i * 30}
                      onMouseLeave={() => hideTooltip()}
                      onMouseEnter={(event) => showTooltipAt(event, d)}
                    />
                  );
                })}
              </Group>
            </svg>

            {tooltipOpen && tooltipData && (
              <ChartTooltip
                containerBounds={containerBounds}
                left={tooltipLeft ?? 0}
                top={tooltipTop ?? 0}
              >
                <div className="font-bold text-amber-400">
                  {tooltipData.title} ({tooltipData.year})
                </div>
                <div className="text-slate-200">
                  Distance:{' '}
                  <span className="font-mono">
                    {tooltipData.totalRunningDistanceFeet.toLocaleString()} ft
                  </span>
                </div>
              </ChartTooltip>
            )}
          </>
        );
      }}
    </ChartWrapper>
  );
};
