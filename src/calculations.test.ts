import { describe, expect, it } from 'vitest';
import { runChecks, segmentCurrent, totalCurrent } from './calculations';
import { sampleLayout } from './model';

describe('current estimates', () => {
  it('applies pixel current and brightness', () => {
    const layout = sampleLayout();
    expect(segmentCurrent(layout.segments[0], layout)).toBeCloseTo(4.32);
    expect(totalCurrent(layout)).toBeCloseTo(11.52);
  });

  it('flags the sample missing injection', () => {
    const warnings = runChecks(sampleLayout()).filter((check) => check.level === 'warn');
    expect(warnings.map((check) => check.title)).toContain('Ground run has no power point');
  });
});
