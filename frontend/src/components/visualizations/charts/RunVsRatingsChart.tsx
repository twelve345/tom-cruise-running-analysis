import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { ChartWrapper } from '../shared/ChartWrapper';
import { DarkAxisBottom, DarkAxisLeft } from '../shared/DarkThemeAxis';
import { AnimatedBar } from '../shared/AnimatedBar';
import { ChartTooltip } from '../shared/ChartTooltip';
import { useChartTooltip } from '../shared/useChartTooltip';
import { innerSize } from '../shared/chartLayout';
import { getCategory } from '../../../utils/distanceCategories';
import { getCategoryColor } from '../shared/chartTheme';

interface FilmData {
  title: string;
  year: number;
  totalRunningDistanceFeet: number;
  rottenTomatoesScore?: number | null;
}

interface RunVsRatingsChartProps {
  data: FilmData[];
}

export const RunVsRatingsChart: React.FC<RunVsRatingsChartProps> = ({ data }) => {
  const {
    containerRef,
    containerBounds,
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltipAt,
  } = useChartTooltip<{ category: string; averageScore: number; count: number }>();

  // Aggregate data by category
  const aggregatedData = useMemo(() => {
    const categories: Record<string, number[]> = {
      'No Run (0 ft)': [],
      'Short Sprint (1-500 ft)': [],
      'Middle-Distance (501-1000 ft)': [],
      'Full Tom (1001+ ft)': [],
    };

    data.forEach((film) => {
      const catKey = getCategory(film.totalRunningDistanceFeet);
      let label = '';
      if (catKey === 'none') label = 'No Run (0 ft)';
      else if (catKey === 'sprint') label = 'Short Sprint (1-500 ft)';
      else if (catKey === 'middle') label = 'Middle-Distance (501-1000 ft)';
      else if (catKey === 'full-tom') label = 'Full Tom (1001+ ft)';

      if (label && film.rottenTomatoesScore != null) {
        categories[label].push(film.rottenTomatoesScore);
      }
    });

    return Object.keys(categories).map((key) => {
      const scores = categories[key];
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return {
        category: key,
        averageScore: avg,
        count: scores.length,
      };
    });
  }, [data]);

  if (!aggregatedData || aggregatedData.length === 0) return null;

  // Colors mapping

  return (
    <ChartWrapper height={450}>
      {({ width, height }) => {
        const margin = { top: 20, right: 30, bottom: 50, left: 180 };
        const { xMax, yMax } = innerSize(width, height, margin);

        const yScale = scaleBand<string>({
          range: [0, yMax],
          domain: aggregatedData.map((d) => d.category),
          padding: 0.2,
        });

        const xScale = scaleLinear<number>({
          range: [0, xMax],
          domain: [0, 100], // Score is 0-100
        });

        return (
          <>
            <svg ref={containerRef} width={width} height={height}>
              <Group top={margin.top} left={margin.left}>
                <DarkAxisLeft scale={yScale} tickFormat={(v) => v as string} />
                <DarkAxisBottom
                  top={yMax}
                  scale={xScale}
                  numTicks={5}
                  label="Average Tomatometer Score"
                  tickFormat={(v) => `${v}%`}
                />

                {aggregatedData.map((d, i) => {
                  const barWidth = xScale(d.averageScore);
                  const barHeight = yScale.bandwidth();
                  const barX = 0;
                  const barY = yScale(d.category);

                  return (
                    <AnimatedBar
                      key={`bar-${d.category}`}
                      x={barX}
                      y={barY ?? 0}
                      width={barWidth}
                      height={barHeight}
                      fill={getCategoryColor(d.category)}
                      delay={i * 100}
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
                <div className="font-bold text-slate-200">{tooltipData.category}</div>
                <div className="text-slate-300">
                  Avg Score:{' '}
                  <span className="font-mono font-bold text-amber-400">
                    {tooltipData.averageScore.toFixed(1)}%
                  </span>
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  Based on {tooltipData.count} films
                </div>
              </ChartTooltip>
            )}
          </>
        );
      }}
    </ChartWrapper>
  );
};
