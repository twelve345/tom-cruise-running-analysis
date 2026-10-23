export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Plot-area size inside the margins, never negative. On a container narrower than the
 * margins (e.g. a horizontal bar chart's 180px label column on a small phone) a
 * negative size would reach <rect width> and the browser rejects it.
 */
export const innerSize = (width: number, height: number, margin: ChartMargin) => ({
  xMax: Math.max(0, width - margin.left - margin.right),
  yMax: Math.max(0, height - margin.top - margin.bottom),
});

/**
 * Upper bound for a [0, max] linear domain. When every value is 0 (or there are none),
 * d3 maps a flat [0, 0] domain to the middle of the range, so all-zero data would draw
 * half-length bars and mid-height lines. Falling back to 1 keeps zero at the baseline.
 */
export const domainMax = (values: number[], headroom = 1): number => {
  const max = Math.max(0, ...values) * headroom;
  return max > 0 ? max : 1;
};
