import { domainMax, innerSize } from './chartLayout';

describe('innerSize', () => {
  const margin = { top: 20, right: 30, bottom: 50, left: 180 };

  it('subtracts the margins', () => {
    expect(innerSize(600, 500, margin)).toEqual({ xMax: 390, yMax: 430 });
  });

  it('never goes negative on a container narrower than the margins', () => {
    expect(innerSize(150, 40, margin)).toEqual({ xMax: 0, yMax: 0 });
  });
});

describe('domainMax', () => {
  it('returns the largest value', () => {
    expect(domainMax([3, 9, 4])).toBe(9);
  });

  it('applies headroom', () => {
    expect(domainMax([100], 1.1)).toBeCloseTo(110);
  });

  it('falls back to 1 for empty or all-zero data so zero stays on the baseline', () => {
    expect(domainMax([])).toBe(1);
    expect(domainMax([0, 0])).toBe(1);
  });
});
