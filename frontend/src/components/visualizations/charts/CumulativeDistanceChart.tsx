import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { LinePath, AreaClosed, Bar, Line } from '@visx/shape';
import { GlyphCircle } from '@visx/glyph';
import { scaleLinear } from '@visx/scale';
import { localPoint } from '@visx/event';
import { ChartWrapper } from '../shared/ChartWrapper';
import { DarkAxisBottom, DarkAxisLeft } from '../shared/DarkThemeAxis';
import { ChartTooltip } from '../shared/ChartTooltip';
import { useChartTooltip } from '../shared/useChartTooltip';
import { innerSize, domainMax } from '../shared/chartLayout';
import { colors } from '../shared/chartTheme';
import { curveMonotoneX } from '@visx/curve';
import { LinearGradient } from '@visx/gradient';
import { bisector } from 'd3-array';

interface FilmData {
  title: string;
  year: number;
  totalRunningDistanceFeet: number;
}

interface CumulativeDistanceChartProps {
  data: FilmData[];
}

export const CumulativeDistanceChart: React.FC<CumulativeDistanceChartProps> = ({ data }) => {
  const {
    containerRef,
    containerOffset,
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useChartTooltip<{ year: number; distance: number; title: string }>();

  // Calculate cumulative distance
  const cumulativeData = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.year - b.year);
    const points: { year: number; distance: number; title: string }[] = [];
    let total = 0;
    for (const f of sorted) {
      total += f.totalRunningDistanceFeet;
      points.push({ year: f.year, distance: total, title: f.title });
    }
    return points;
  }, [data]);

  // Accessors
  const getYear = (d: { year: number }) => d.year;
  const getDistance = (d: { distance: number }) => d.distance;
  // Index of the first point after `year`.
  const bisectAfterYear = bisector<{ year: number }, number>((d) => d.year).right;

  if (!cumulativeData || cumulativeData.length === 0) return null;

  return (
    <ChartWrapper height={450}>
      {({ width, height }) => {
        const margin = { top: 20, right: 30, bottom: 50, left: 60 };
        const { xMax, yMax } = innerSize(width, height, margin);

        // Scales
        const xScale = scaleLinear<number>({
          range: [0, xMax],
          domain: [
            Math.min(...cumulativeData.map(getYear)),
            Math.max(...cumulativeData.map(getYear)),
          ],
          nice: true,
        });

        const yScale = scaleLinear<number>({
          range: [yMax, 0],
          domain: [0, domainMax(cumulativeData.map(getDistance))],
          nice: true,
        });

        const handleTooltip = (
          event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>
        ) => {
          const { x } = localPoint(event) || { x: 0 };
          const x0 = xScale.invert(x - margin.left);
          // A year with several films has several points at the same x, and the career
          // total through that year is its LAST point. Snap to the nearest year, then take
          // that year's last point.
          const after = bisectAfterYear(cumulativeData, x0);
          const prevYear = after > 0 ? getYear(cumulativeData[after - 1]) : undefined;
          const nextYear =
            after < cumulativeData.length ? getYear(cumulativeData[after]) : undefined;
          const year =
            prevYear === undefined || (nextYear !== undefined && nextYear - x0 < x0 - prevYear)
              ? (nextYear as number)
              : prevYear;
          const d = cumulativeData[bisectAfterYear(cumulativeData, year) - 1];
          showTooltip({
            tooltipData: d,
            tooltipLeft: xScale(getYear(d)) + margin.left,
            tooltipTop: yScale(getDistance(d)) + margin.top,
          });
        };

        return (
          <>
            <svg ref={containerRef} width={width} height={height}>
              <LinearGradient
                id="area-gradient"
                from={colors.amber[500]}
                to={colors.amber[500]}
                fromOpacity={0.4}
                toOpacity={0.1}
              />

              <Group top={margin.top} left={margin.left}>
                <DarkAxisBottom top={yMax} scale={xScale} tickFormat={(v) => `${v}`} />
                <DarkAxisLeft
                  scale={yScale}
                  tickFormat={(v) => {
                    return typeof v === 'number' && v >= 1000
                      ? (v / 1000).toFixed(0) + 'k'
                      : `${v}`;
                  }}
                  label="Cumulative Distance (feet)"
                />

                <AreaClosed
                  data={cumulativeData}
                  x={(d) => xScale(getYear(d))}
                  y={(d) => yScale(getDistance(d))}
                  yScale={yScale}
                  strokeWidth={0}
                  fill="url(#area-gradient)"
                  curve={curveMonotoneX}
                />

                <LinePath
                  data={cumulativeData}
                  x={(d) => xScale(getYear(d))}
                  y={(d) => yScale(getDistance(d))}
                  stroke={colors.amber[500]}
                  strokeWidth={3}
                  curve={curveMonotoneX}
                />

                {cumulativeData.map((d, i) => (
                  <GlyphCircle
                    key={`point-${i}`}
                    left={xScale(getYear(d))}
                    top={yScale(getDistance(d))}
                    size={20}
                    fill={colors.amber[500]}
                    stroke={colors.slate[900]}
                    strokeWidth={1}
                  />
                ))}
              </Group>

              {/* Overlay for tooltip interactions */}
              <Bar
                x={margin.left}
                y={margin.top}
                width={xMax}
                height={yMax}
                fill="transparent"
                rx={14}
                onTouchStart={handleTooltip}
                onTouchMove={handleTooltip}
                onMouseMove={handleTooltip}
                onMouseLeave={() => hideTooltip()}
              />

              {/* Crosshair */}
              {tooltipOpen && tooltipData && (
                <Group>
                  <Line
                    from={{ x: tooltipLeft, y: margin.top }}
                    to={{ x: tooltipLeft, y: yMax + margin.top }}
                    stroke={colors.slate[400]}
                    strokeWidth={1}
                    pointerEvents="none"
                    strokeDasharray="5,5"
                  />
                  <Line
                    from={{ x: margin.left, y: tooltipTop }}
                    to={{ x: xMax + margin.left, y: tooltipTop }}
                    stroke={colors.slate[400]}
                    strokeWidth={1}
                    pointerEvents="none"
                    strokeDasharray="5,5"
                  />
                  <circle
                    cx={tooltipLeft}
                    cy={tooltipTop}
                    r={6}
                    fill={colors.amber[500]}
                    stroke="white"
                    strokeWidth={2}
                    pointerEvents="none"
                  />
                </Group>
              )}
            </svg>

            {tooltipOpen && tooltipData && (
              <ChartTooltip
                containerOffset={containerOffset}
                left={tooltipLeft ?? 0}
                top={tooltipTop ?? 0}
              >
                <div className="font-bold text-slate-200">
                  {tooltipData.year} - {tooltipData.title}
                </div>
                <div className="text-slate-300 mt-1">
                  Total:{' '}
                  <span className="font-mono font-bold text-amber-400">
                    {tooltipData.distance.toLocaleString()} ft
                  </span>
                </div>
                <div className="text-slate-400 text-xs">
                  ({(tooltipData.distance / 5280).toFixed(2)} miles)
                </div>
              </ChartTooltip>
            )}
          </>
        );
      }}
    </ChartWrapper>
  );
};
