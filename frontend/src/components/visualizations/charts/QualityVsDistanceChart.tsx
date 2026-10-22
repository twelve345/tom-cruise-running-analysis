import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { GlyphCircle } from '@visx/glyph';
import { scaleLinear } from '@visx/scale';
import { Line } from '@visx/shape';
import { ChartWrapper } from '../shared/ChartWrapper';
import { DarkAxisBottom, DarkAxisLeft } from '../shared/DarkThemeAxis';
import { ChartTooltip } from '../shared/ChartTooltip';
import { useChartTooltip } from '../shared/useChartTooltip';
import { innerSize } from '../shared/chartLayout';
import { colors } from '../shared/chartTheme';

interface FilmData {
  title: string;
  year: number;
  totalRunningDistanceFeet: number;
  rottenTomatoesScore?: number | null;
}

interface QualityVsDistanceChartProps {
  data: FilmData[];
}

export const QualityVsDistanceChart: React.FC<QualityVsDistanceChartProps> = ({ data }) => {
  const {
    containerRef,
    containerBounds,
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useChartTooltip<FilmData>();

  // Filter data
  const scatterData = useMemo(() => {
    return data.filter((f) => f.totalRunningDistanceFeet > 0 && f.rottenTomatoesScore != null);
  }, [data]);

  if (!scatterData || scatterData.length === 0) return null;

  // Accessors
  const getDistance = (d: FilmData) => d.totalRunningDistanceFeet;
  const getScore = (d: FilmData) => d.rottenTomatoesScore ?? 0;

  return (
    <ChartWrapper height={450}>
      {({ width, height }) => {
        const margin = { top: 20, right: 30, bottom: 50, left: 60 };
        const { xMax, yMax } = innerSize(width, height, margin);

        // Scales
        const xScale = scaleLinear<number>({
          range: [0, xMax],
          domain: [0, Math.max(...scatterData.map(getDistance)) * 1.1],
          nice: true,
        });

        const yScale = scaleLinear<number>({
          range: [yMax, 0],
          domain: [0, 100],
          nice: true,
        });

        return (
          <>
            <svg ref={containerRef} width={width} height={height}>
              <Group top={margin.top} left={margin.left}>
                <DarkAxisBottom
                  top={yMax}
                  scale={xScale}
                  label="Running Distance (feet)"
                  tickFormat={(v) => `${v}`}
                />
                <DarkAxisLeft
                  scale={yScale}
                  label="Rotten Tomatoes Score (%)"
                  tickFormat={(v) => `${v}%`}
                />

                {tooltipOpen && tooltipData && (
                  <Group>
                    <Line
                      from={{
                        x: xScale(getDistance(tooltipData)),
                        y: yScale(getScore(tooltipData)),
                      }}
                      to={{ x: xScale(getDistance(tooltipData)), y: yMax }}
                      stroke={colors.slate[500]}
                      strokeWidth={1}
                      strokeDasharray="4,4"
                      pointerEvents="none"
                    />
                    <Line
                      from={{ x: 0, y: yScale(getScore(tooltipData)) }}
                      to={{ x: xScale(getDistance(tooltipData)), y: yScale(getScore(tooltipData)) }}
                      stroke={colors.slate[500]}
                      strokeWidth={1}
                      strokeDasharray="4,4"
                      pointerEvents="none"
                    />
                  </Group>
                )}

                {scatterData.map((d, i) => (
                  <GlyphCircle
                    key={`point-${i}`}
                    left={xScale(getDistance(d))}
                    top={yScale(getScore(d))}
                    size={tooltipOpen && tooltipData === d ? 120 : 60}
                    fill={colors.blue[500]}
                    fillOpacity={0.8}
                    stroke={colors.blue[400]}
                    strokeWidth={1}
                    onMouseLeave={() => hideTooltip()}
                    onMouseEnter={() => {
                      showTooltip({
                        tooltipData: d,
                        tooltipLeft: xScale(getDistance(d)) + margin.left,
                        tooltipTop: yScale(getScore(d)) + margin.top,
                      });
                    }}
                    className="cursor-pointer"
                  />
                ))}
              </Group>
            </svg>

            {tooltipOpen && tooltipData && (
              <ChartTooltip
                containerBounds={containerBounds}
                left={tooltipLeft ?? 0}
                top={tooltipTop ?? 0}
              >
                <div className="font-bold text-slate-200">
                  {tooltipData.title} ({tooltipData.year})
                </div>
                <div className="text-slate-300 mt-1">
                  Distance:{' '}
                  <span className="font-mono font-bold text-amber-400">
                    {tooltipData.totalRunningDistanceFeet.toLocaleString()} ft
                  </span>
                </div>
                <div className="text-slate-300">
                  RT Score:{' '}
                  <span className="font-mono font-bold text-blue-400">
                    {tooltipData.rottenTomatoesScore}%
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
