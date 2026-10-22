import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { GlyphCircle } from '@visx/glyph';
import { scaleLinear } from '@visx/scale';
import { useTooltip } from '@visx/tooltip';
import { Line } from '@visx/shape';
import { ChartWrapper } from '../shared/ChartWrapper';
import { DarkAxisBottom, DarkAxisLeft } from '../shared/DarkThemeAxis';
import { ChartTooltip } from '../shared/ChartTooltip';
import { colors } from '../shared/chartTheme';

interface FilmData {
  title: string;
  year: number;
  totalRunningDistanceFeet: number;
  rottenTomatoesScore?: number | null;
  cpiScore?: number | null;
}

interface CPIPerformanceMapProps {
  data: FilmData[];
}

export const CPIPerformanceMap: React.FC<CPIPerformanceMapProps> = ({ data }) => {
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<FilmData>();

  // Filter data
  const scatterData = useMemo(() => {
    return data.filter((f) => f.cpiScore && f.cpiScore > 0);
  }, [data]);

  if (!scatterData || scatterData.length === 0) return null;

  // Accessors
  const getDistance = (d: FilmData) => d.totalRunningDistanceFeet;
  const getScore = (d: FilmData) => d.rottenTomatoesScore ?? 0;
  const getCPI = (d: FilmData) => d.cpiScore ?? 0;

  return (
    <ChartWrapper height={500}>
      {({ width, height }) => {
        const margin = { top: 20, right: 30, bottom: 50, left: 60 };
        const xMax = width - margin.left - margin.right;
        const yMax = height - margin.top - margin.bottom;

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

        // Helper for color/size based on CPI
        const getPointStyle = (cpi: number) => {
          let fill = colors.slate[500];
          let size = 60;

          if (cpi > 20) {
            fill = colors.violet[500];
            size = 300;
          } else if (cpi > 10) {
            fill = colors.violet[400];
            size = 150;
          } else if (cpi > 5) {
            fill = colors.violet[300];
            size = 80;
          } else {
            fill = colors.slate[500];
            size = 40;
          }
          return { fill, size };
        };

        return (
          <>
            <svg width={width} height={height}>
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

                {scatterData.map((d, i) => {
                  const { fill, size } = getPointStyle(getCPI(d));
                  return (
                    <GlyphCircle
                      key={`point-${i}`}
                      left={xScale(getDistance(d))}
                      top={yScale(getScore(d))}
                      size={size}
                      fill={fill}
                      fillOpacity={0.8}
                      stroke={colors.slate[900]}
                      strokeWidth={1}
                      onMouseLeave={() => hideTooltip()}
                      onMouseEnter={() => {
                        showTooltip({
                          tooltipData: d,
                          tooltipLeft: xScale(getDistance(d)) + margin.left,
                          tooltipTop: yScale(getScore(d)) + margin.top,
                        });
                      }}
                      className="transition-all duration-200 hover:opacity-100 cursor-pointer"
                    />
                  );
                })}

                {/* Legend */}
                <Group left={xMax - 120} top={10}>
                  <text x={0} y={0} fill={colors.slate[400]} fontSize={12} fontWeight="bold">
                    CPI Score
                  </text>

                  <circle cx={10} cy={20} r={Math.sqrt(300) / 2} fill={colors.violet[500]} />
                  <text x={25} y={24} fill={colors.slate[300]} fontSize={11}>
                    {'>'} 20 (High)
                  </text>

                  <circle cx={10} cy={40} r={Math.sqrt(150) / 2} fill={colors.violet[400]} />
                  <text x={25} y={44} fill={colors.slate[300]} fontSize={11}>
                    10 - 20
                  </text>

                  <circle cx={10} cy={60} r={Math.sqrt(80) / 2} fill={colors.violet[300]} />
                  <text x={25} y={64} fill={colors.slate[300]} fontSize={11}>
                    5 - 10
                  </text>
                </Group>
              </Group>
            </svg>

            {tooltipOpen && tooltipData && (
              <ChartTooltip left={tooltipLeft ?? 0} top={tooltipTop ?? 0}>
                <div className="font-bold text-slate-200">
                  {tooltipData.title} ({tooltipData.year})
                </div>
                <div className="text-slate-300 mt-1">
                  CPI:{' '}
                  <span className="font-mono font-bold text-violet-400">
                    {tooltipData.cpiScore?.toFixed(2)}
                  </span>
                </div>
                <div className="text-slate-400 text-xs">
                  Distance: {tooltipData.totalRunningDistanceFeet.toLocaleString()} ft
                </div>
                <div className="text-slate-400 text-xs">
                  Score: {tooltipData.rottenTomatoesScore}%
                </div>
              </ChartTooltip>
            )}
          </>
        );
      }}
    </ChartWrapper>
  );
};
