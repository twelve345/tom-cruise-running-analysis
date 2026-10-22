import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { GlyphCircle } from '@visx/glyph';
import { scalePoint, scaleLinear } from '@visx/scale';
import { useTooltip } from '@visx/tooltip';
import { ChartWrapper } from '../shared/ChartWrapper';
import { DarkAxisBottom, DarkAxisLeft, DarkAxisRight } from '../shared/DarkThemeAxis';
import { ChartTooltip } from '../shared/ChartTooltip';
import { colors } from '../shared/chartTheme';
import { curveMonotoneX } from '@visx/curve';

interface FilmData {
  title: string;
  year: number;
  totalRunningDistanceFeet: number;
  rottenTomatoesScore?: number | null;
}

interface MissionImpossibleChartProps {
  data: FilmData[];
}

export const MissionImpossibleChart: React.FC<MissionImpossibleChartProps> = ({ data }) => {
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<FilmData>();

  // Filter for MI films and sort by year
  const miData = useMemo(() => {
    return [...data]
      .filter((f) => f.title.toLowerCase().includes('mission: impossible'))
      .sort((a, b) => a.year - b.year);
  }, [data]);

  if (!miData || miData.length === 0) return null;

  // Accessors
  const getLabel = (d: FilmData) => {
    const shortTitle = d.title.replace('Mission: Impossible', 'M:I');
    return `${shortTitle.substring(0, 25)} (${d.year})`;
  };
  const getDistance = (d: FilmData) => d.totalRunningDistanceFeet;
  const getScore = (d: FilmData) => d.rottenTomatoesScore ?? 0;

  return (
    <ChartWrapper height={450}>
      {({ width, height }) => {
        const margin = { top: 20, right: 60, bottom: 100, left: 60 };
        const xMax = width - margin.left - margin.right;
        const yMax = height - margin.top - margin.bottom;

        // Scales
        const xScale = scalePoint<string>({
          range: [0, xMax],
          domain: miData.map(getLabel),
          padding: 0.5,
        });

        const yDistanceScale = scaleLinear<number>({
          range: [yMax, 0],
          domain: [0, Math.max(...miData.map(getDistance)) * 1.1],
          nice: true,
        });

        const yScoreScale = scaleLinear<number>({
          range: [yMax, 0],
          domain: [0, 100],
          nice: true,
        });

        return (
          <>
            <svg width={width} height={height}>
              <Group top={margin.top} left={margin.left}>
                <DarkAxisBottom
                  top={yMax}
                  scale={xScale}
                  tickFormat={(v) => {
                    // Truncate or wrap if needed
                    return v.length > 20 ? `${v.substring(0, 20)}...` : v;
                  }}
                />
                <DarkAxisLeft
                  scale={yDistanceScale}
                  label="Running Distance (feet)"
                  tickFormat={(v) => `${v}`}
                />
                <DarkAxisRight
                  left={xMax}
                  scale={yScoreScale}
                  label="Rotten Tomatoes Score (%)"
                  tickFormat={(v) => `${v}%`}
                />

                {/* Distance Line */}
                <LinePath
                  data={miData}
                  x={(d) => xScale(getLabel(d)) ?? 0}
                  y={(d) => yDistanceScale(getDistance(d))}
                  stroke={colors.amber[500]}
                  strokeWidth={3}
                  curve={curveMonotoneX}
                />
                {miData.map((d, i) => (
                  <GlyphCircle
                    key={`dist-point-${i}`}
                    left={xScale(getLabel(d)) ?? 0}
                    top={yDistanceScale(getDistance(d))}
                    size={60}
                    fill={colors.amber[500]}
                    stroke={colors.slate[900]}
                    strokeWidth={2}
                    onMouseLeave={() => hideTooltip()}
                    onMouseEnter={(event) => {
                      showTooltip({
                        tooltipData: d,
                        tooltipLeft: event.clientX,
                        tooltipTop: event.clientY,
                      });
                    }}
                  />
                ))}

                {/* Score Line */}
                <LinePath
                  data={miData}
                  x={(d) => xScale(getLabel(d)) ?? 0}
                  y={(d) => yScoreScale(getScore(d))}
                  stroke={colors.slate[400]} // Or Green/Success color? Original used success.
                  strokeWidth={3}
                  curve={curveMonotoneX}
                  strokeDasharray="5,5"
                />
                {miData.map((d, i) => (
                  <GlyphCircle
                    key={`score-point-${i}`}
                    left={xScale(getLabel(d)) ?? 0}
                    top={yScoreScale(getScore(d))}
                    size={60}
                    fill={colors.slate[400]}
                    stroke={colors.slate[900]}
                    strokeWidth={2}
                    onMouseLeave={() => hideTooltip()}
                    onMouseEnter={(event) => {
                      showTooltip({
                        tooltipData: d,
                        tooltipLeft: event.clientX,
                        tooltipTop: event.clientY,
                      });
                    }}
                  />
                ))}

                {/* Legend */}
                <Group left={20} top={10}>
                  <rect width={12} height={12} fill={colors.amber[500]} rx={2} />
                  <text x={20} y={10} fill={colors.slate[300]} fontSize={12}>
                    Distance
                  </text>

                  <rect x={100} y={0} width={12} height={12} fill={colors.slate[400]} rx={2} />
                  <text x={120} y={10} fill={colors.slate[300]} fontSize={12}>
                    RT Score
                  </text>
                </Group>
              </Group>
            </svg>

            {tooltipOpen && tooltipData && (
              <ChartTooltip left={tooltipLeft ?? 0} top={tooltipTop ?? 0}>
                <div className="font-bold text-amber-400">
                  {tooltipData.title} ({tooltipData.year})
                </div>
                <div className="text-slate-200 mt-1">
                  Distance:{' '}
                  <span className="font-mono font-bold text-amber-500">
                    {tooltipData.totalRunningDistanceFeet.toLocaleString()} ft
                  </span>
                </div>
                <div className="text-slate-200">
                  RT Score:{' '}
                  <span className="font-mono font-bold text-slate-400">
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
