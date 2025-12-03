import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { ChartWrapper } from '../shared/ChartWrapper';
import { ChartTooltip } from '../shared/ChartTooltip';
import { DarkAxisBottom, DarkAxisLeft } from '../shared/DarkThemeAxis';
import { AnimatedBar } from '../shared/AnimatedBar';
import { useTooltip } from '@visx/tooltip';
import { colors } from '../shared/chartTheme';

interface FilmData {
  title: string;
  year: number;
  cpiScore?: number;
  totalRunningDistanceFeet: number;
  rottenTomatoesScore?: number;
}

interface CPILeaderboardChartProps {
  data: FilmData[];
}

export const CPILeaderboardChart: React.FC<CPILeaderboardChartProps> = ({ data }) => {
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<FilmData>();

  // Sort by CPI descending and take top 10
  const sortedData = useMemo(() => {
    return [...data]
      .filter((d) => d.cpiScore !== undefined && d.cpiScore !== null)
      .sort((a, b) => (b.cpiScore ?? 0) - (a.cpiScore ?? 0))
      .slice(0, 10);
  }, [data]);

  if (!sortedData || sortedData.length === 0) return null;

  // Accessors
  const getTitle = (d: FilmData) => d.title;
  const getCPI = (d: FilmData) => d.cpiScore ?? 0;

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
          domain: [0, Math.max(...sortedData.map(getCPI))],
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
                  label="CPI Score"
                  tickFormat={(v) => `${v}`}
                />

                {sortedData.map((d, i) => {
                  const title = getTitle(d);
                  const barWidth = xScale(getCPI(d));
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
                      fill={colors.amber[500]} // Or secondary color (blue) as per original? Original used secondary.
                      // Let's use blue for CPI to distinguish from Distance
                      // colors.slate[400] is blue-ish in my theme? No slate is grey.
                      // I should add blue to my theme or use hex.
                      // Original used 'rgba(59, 130, 246, 0.8)' which is blue-500.
                      // I'll use a hardcoded blue for now or add to theme later.
                      // Let's use '#3b82f6' (blue-500)
                      delay={i * 50}
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
                  CPI Score:{' '}
                  <span className="font-mono font-bold text-blue-400">
                    {tooltipData.cpiScore?.toFixed(2)}
                  </span>
                </div>
                <div className="text-slate-300 text-xs mt-1">
                  Distance: {tooltipData.totalRunningDistanceFeet.toLocaleString()} ft
                </div>
              </ChartTooltip>
            )}
          </>
        );
      }}
    </ChartWrapper>
  );
};
