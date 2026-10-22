import React from 'react';
import { Pie, arc } from '@visx/shape';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { LegendOrdinal } from '@visx/legend';
import { scaleOrdinal } from '@visx/scale';

import { ChartWrapper } from '../shared/ChartWrapper';
import { ChartTooltip } from '../shared/ChartTooltip';
import { useChartTooltip } from '../shared/useChartTooltip';
import { colors, getCategoryColor } from '../shared/chartTheme';

interface FilmographyBreakdownChartProps {
  data: { label: string; count: number }[];
}

export const FilmographyBreakdownChart: React.FC<FilmographyBreakdownChartProps> = ({ data }) => {
  const {
    containerRef,
    containerBounds,
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltipAt,
  } = useChartTooltip<{ label: string; count: number; percentage: number }>();

  if (!data || data.length === 0) return null;

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  const ordinalColorScale = scaleOrdinal({
    domain: ['No Run', 'Short Sprint', 'Middle-Distance', 'Full Tom'],
    range: [
      getCategoryColor('No Run'),
      getCategoryColor('Short Sprint'),
      getCategoryColor('Middle-Distance'),
      getCategoryColor('Full Tom'),
    ],
  });

  return (
    <>
      <ChartWrapper height={400}>
        {({ width, height }) => {
          const radius = Math.min(width, height) / 2;
          const innerRadius = radius * 0.6;
          const centerY = height / 2;
          const centerX = width / 2;

          return (
            <>
              <svg ref={containerRef} width={width} height={height}>
                <Group top={centerY} left={centerX}>
                  <Pie
                    data={data}
                    pieValue={(d) => d.count}
                    outerRadius={radius - 20}
                    innerRadius={innerRadius}
                    padAngle={0.02}
                    cornerRadius={4}
                  >
                    {(pie) => {
                      return pie.arcs.map((pieArc, index) => {
                        const { label, count } = pieArc.data;
                        const isHovered = tooltipOpen && tooltipData?.label === label;

                        const arcGenerator = arc()
                          .innerRadius(innerRadius)
                          .outerRadius(radius - 20)
                          .padAngle(0.02)
                          .cornerRadius(4);

                        const arcGeneratorHover = arc()
                          .innerRadius(innerRadius)
                          .outerRadius(radius - 10) // Pop out 10px
                          .padAngle(0.02)
                          .cornerRadius(4);

                        const arcPath = isHovered
                          ? arcGeneratorHover(pieArc)
                          : arcGenerator(pieArc);

                        return (
                          <g key={`arc-${label}-${index}`}>
                            <path
                              d={arcPath || ''}
                              fill={getCategoryColor(label)}
                              fillOpacity={isHovered ? 1 : 0.8}
                              stroke={colors.slate[900]}
                              strokeWidth={2}
                              onMouseLeave={() => hideTooltip()}
                              onMouseMove={(event) =>
                                showTooltipAt(event, {
                                  label,
                                  count,
                                  percentage: (count / total) * 100,
                                })
                              }
                              className="transition-all duration-300 cursor-pointer"
                            />
                            {/* Labels inside arcs if space permits? Maybe too crowded. */}
                          </g>
                        );
                      });
                    }}
                  </Pie>

                  {/* Center Text */}
                  <Text
                    textAnchor="middle"
                    fill={colors.slate[100]}
                    fontSize={24}
                    fontWeight="bold"
                    dy={-10}
                  >
                    {total}
                  </Text>
                  <Text textAnchor="middle" fill={colors.slate[400]} fontSize={14} dy={15}>
                    Films
                  </Text>
                </Group>
              </svg>

              {tooltipOpen && tooltipData && (
                <ChartTooltip
                  containerBounds={containerBounds}
                  left={tooltipLeft ?? 0}
                  top={tooltipTop ?? 0}
                >
                  <div className="font-semibold text-amber-400">{tooltipData.label}</div>
                  <div className="text-slate-200">
                    {tooltipData.count} films ({tooltipData.percentage.toFixed(1)}%)
                  </div>
                </ChartTooltip>
              )}
            </>
          );
        }}
      </ChartWrapper>

      {/* Outside ChartWrapper: inside it, the fixed-height overflow-hidden box clipped it. */}
      <div className="flex justify-center mt-4">
        <LegendOrdinal scale={ordinalColorScale} direction="row" labelMargin="0 15px 0 0">
          {(labels) => (
            <div className="flex flex-wrap justify-center gap-4">
              {labels.map((label, i) => (
                <div key={`legend-${i}`} className="flex items-center">
                  <svg width={10} height={10} className="mr-2">
                    <rect width={10} height={10} fill={label.value} rx={2} />
                  </svg>
                  <span className="text-sm text-slate-300">{label.text}</span>
                </div>
              ))}
            </div>
          )}
        </LegendOrdinal>
      </div>
    </>
  );
};
