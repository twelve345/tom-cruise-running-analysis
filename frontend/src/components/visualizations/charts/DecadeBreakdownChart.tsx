import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { BarGroup } from '@visx/shape';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { useTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { ChartWrapper } from '../shared/ChartWrapper';
import { DarkAxisBottom, DarkAxisLeft } from '../shared/DarkThemeAxis';
import { ChartTooltip } from '../shared/ChartTooltip';
import { AnimatedBar } from '../shared/AnimatedBar';
import { colors } from '../shared/chartTheme';

interface FilmData {
  year: number;
  totalRunningDistanceFeet: number;
}

interface DecadeBreakdownChartProps {
  data: FilmData[];
}

interface DecadeStats {
  decade: string;
  Average: number;
  Total: number;
}

export const DecadeBreakdownChart: React.FC<DecadeBreakdownChartProps> = ({ data }) => {
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<{ key: string; value: number; decade: string }>();

  // Aggregate data by decade
  const aggregatedData = useMemo(() => {
    const decadeData: Record<string, { distance: number[]; count: number }> = {
      '1980s': { distance: [], count: 0 },
      '1990s': { distance: [], count: 0 },
      '2000s': { distance: [], count: 0 },
      '2010s': { distance: [], count: 0 },
      '2020s': { distance: [], count: 0 },
    };

    data.forEach((film) => {
      const decade = Math.floor(film.year / 10) * 10;
      const decadeLabel = `${decade}s`;
      if (decadeData[decadeLabel]) {
        decadeData[decadeLabel].distance.push(film.totalRunningDistanceFeet);
        decadeData[decadeLabel].count++;
      }
    });

    return Object.keys(decadeData).map((decade) => {
      const distances = decadeData[decade].distance;
      const total = distances.reduce((a, b) => a + b, 0);
      const avg = distances.length > 0 ? total / distances.length : 0;
      return {
        decade,
        Average: avg,
        Total: total,
      };
    });
  }, [data]);

  if (!aggregatedData || aggregatedData.length === 0) return null;

  const keys = ['Average', 'Total'];

  // Accessors
  const getDecade = (d: DecadeStats) => d.decade;

  return (
    <ChartWrapper height={400}>
      {({ width, height }) => {
        const margin = { top: 40, right: 30, bottom: 50, left: 60 };
        const xMax = width - margin.left - margin.right;
        const yMax = height - margin.top - margin.bottom;

        // Scales
        const x0Scale = scaleBand<string>({
          domain: aggregatedData.map(getDecade),
          padding: 0.2,
          range: [0, xMax],
        });

        const x1Scale = scaleBand<string>({
          domain: keys,
          padding: 0.1,
          range: [0, x0Scale.bandwidth()],
        });

        const yScale = scaleLinear<number>({
          domain: [0, Math.max(...aggregatedData.map((d) => Math.max(d.Average, d.Total)))],
          range: [yMax, 0],
          nice: true,
        });

        const colorScale = scaleOrdinal<string, string>({
          domain: keys,
          range: [colors.amber[500], colors.slate[500]], // Average: Amber, Total: Slate (or Blue)
          // Original used Secondary (Blue) for Average and Primary (Amber) for Total.
          // Let's match original intention but with our theme.
          // Average: Blue (Secondary), Total: Amber (Primary)
        });
        // Update range to match original mapping logic better
        colorScale.range(['#3b82f6', colors.amber[500]]);

        return (
          <>
            <svg width={width} height={height}>
              <Group top={margin.top} left={margin.left}>
                <DarkAxisBottom top={yMax} scale={x0Scale} tickFormat={(v) => v} />
                <DarkAxisLeft scale={yScale} tickFormat={(v) => `${v}`} label="Distance (feet)" />

                <BarGroup
                  data={aggregatedData}
                  keys={keys}
                  height={yMax}
                  x0={getDecade}
                  x0Scale={x0Scale}
                  x1Scale={x1Scale}
                  yScale={yScale}
                  color={colorScale}
                >
                  {(barGroups) =>
                    barGroups.map((barGroup) => (
                      <Group key={`bar-group-${barGroup.index}-${barGroup.x0}`} left={barGroup.x0}>
                        {barGroup.bars.map((bar) => (
                          <AnimatedBar
                            key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
                            x={bar.x}
                            y={bar.y}
                            width={bar.width}
                            height={bar.height}
                            fill={bar.color}
                            delay={bar.index * 100}
                            onMouseLeave={() => hideTooltip()}
                            onMouseEnter={(event) => {
                              const point = localPoint(event);
                              showTooltip({
                                tooltipData: {
                                  key: bar.key,
                                  value: bar.value,
                                  decade: getDecade(aggregatedData[barGroup.index]),
                                },
                                tooltipLeft: point?.x,
                                tooltipTop: point?.y,
                              });
                            }}
                            className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                          />
                        ))}
                      </Group>
                    ))
                  }
                </BarGroup>

                {/* Legend */}
                <Group left={xMax - 150} top={-30}>
                  <rect width={12} height={12} fill="#3b82f6" rx={2} />
                  <text x={20} y={10} fill={colors.slate[300]} fontSize={12}>
                    Average Distance
                  </text>

                  <rect x={0} y={20} width={12} height={12} fill={colors.amber[500]} rx={2} />
                  <text x={20} y={30} fill={colors.slate[300]} fontSize={12}>
                    Total Distance
                  </text>
                </Group>
              </Group>
            </svg>

            {tooltipOpen && tooltipData && (
              <ChartTooltip left={tooltipLeft ?? 0} top={tooltipTop ?? 0}>
                <div className="font-bold text-slate-200">{tooltipData.decade}</div>
                <div className="text-slate-300">
                  {tooltipData.key}:{' '}
                  <span className="font-mono font-bold text-amber-400">
                    {tooltipData.value.toLocaleString()} ft
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
