import React from 'react';
import { Pie } from '@visx/shape';
import { Group } from '@visx/group';
import { Text } from '@visx/text';

import { ChartWrapper } from '../shared/ChartWrapper';
import { ChartTooltip } from '../shared/ChartTooltip';
import { useTooltip } from '@visx/tooltip';
import { colors } from '../shared/chartTheme';

interface FilmographyBreakdownChartProps {
  data: { label: string; count: number }[];
}

export const FilmographyBreakdownChart: React.FC<FilmographyBreakdownChartProps> = ({ data }) => {
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<{ label: string; count: number; percentage: number }>();

  if (!data || data.length === 0) return null;

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  // Override with specific colors to match original design but better
  const getSegmentColor = (label: string) => {
    switch (label) {
      case 'No Run':
        return colors.slate[600];
      case 'Short Sprint':
        return '#3b82f6'; // Blue-500
      case 'Middle-Distance':
        return '#eab308'; // Yellow-500
      case 'Full Tom':
        return '#f97316'; // Orange-500
      default:
        return colors.slate[500];
    }
  };

  return (
    <ChartWrapper height={400}>
      {({ width, height }) => {
        const radius = Math.min(width, height) / 2;
        const innerRadius = radius * 0.6;
        const centerY = height / 2;
        const centerX = width / 2;

        return (
          <>
            <svg width={width} height={height}>
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
                    return pie.arcs.map((arc, index) => {
                      const { label, count } = arc.data;
                      const arcPath = pie.path(arc);
                      const isHovered = tooltipOpen && tooltipData?.label === label;

                      return (
                        <g key={`arc-${label}-${index}`}>
                          <path
                            d={arcPath || ''}
                            fill={getSegmentColor(label)}
                            fillOpacity={isHovered ? 1 : 0.8}
                            stroke={colors.slate[900]}
                            strokeWidth={2}
                            onMouseLeave={() => hideTooltip()}
                            onMouseMove={(event) => {
                              const percentage = (count / total) * 100;
                              showTooltip({
                                tooltipData: { label, count, percentage },
                                tooltipLeft: event.clientX, // Use clientX/Y for portal tooltip or relative for SVG
                                tooltipTop: event.clientY,
                              });
                            }}
                            // Use localPoint if needed, but for now simple event coordinates
                            // Actually ChartTooltip uses absolute positioning usually
                            onMouseEnter={(_event) => {
                              // Logic handled in mousemove
                            }}
                            className="transition-all duration-300 cursor-pointer"
                            style={{
                              transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                              transformOrigin: 'center',
                            }}
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
              <ChartTooltip left={tooltipLeft ?? 0} top={tooltipTop ?? 0}>
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
  );
};
