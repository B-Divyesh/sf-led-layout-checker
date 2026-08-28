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

  it('flags a supply voltage that does not match the plan', () => {
    const layout = sampleLayout();
    layout.voltage = 12;
    const warnings = runChecks(layout).filter((check) => check.level === 'warn');
    expect(warnings.map((check) => check.title)).toContain('Supply A voltage does not match');
    expect(warnings.find((check) => check.title.includes('Supply A'))?.detail).toContain('5 V supply; 12 V LED plan');
  });

  it('@claim:preflight-rules flags the documented layout assumptions', () => {
    const layout = sampleLayout();
    layout.segments[0].controllerId = 'missing-controller';
    layout.supplies[0].volts = 12;
    layout.supplies.forEach((supply) => { supply.amps = 1; });
    const titles = runChecks(layout).map((check) => check.title);

    expect(titles).toContain('Ground run has no power point');
    expect(titles).toContain('Arch right may need end injection');
    expect(titles).toContain('Arch left has no controller');
    expect(titles).toContain('Supply A voltage does not match');
    expect(titles).toContain('Supply headroom is low');
  });
});
