import type { Check, Layout, Segment } from './model';

export function segmentCurrent(segment: Segment, layout: Layout): number {
  return segment.pixels * layout.milliAmpsPerPixel * (layout.brightness / 100) / 1000;
}

export function totalCurrent(layout: Layout): number {
  return layout.segments.reduce((sum, segment) => sum + segmentCurrent(segment, layout), 0);
}

export function totalWatts(layout: Layout): number {
  return totalCurrent(layout) * layout.voltage;
}

export function runChecks(layout: Layout): Check[] {
  if (!layout.segments.length) {
    return [{ level: 'warn', title: 'No LED segments yet', detail: 'Draw a segment to start the preflight.' }];
  }

  const checks: Check[] = [];
  for (const segment of layout.segments) {
    const amps = segmentCurrent(segment, layout);
    if (segment.injection === 'none') {
      checks.push({ level: 'warn', title: `${segment.name} has no power point`, detail: 'Set where power enters this segment.', segmentId: segment.id });
    } else if (segment.pixels >= 150 && segment.injection !== 'both') {
      checks.push({ level: 'warn', title: `${segment.name} may need end injection`, detail: `${segment.pixels} pixels share one stated power point. Check wire size and voltage drop.`, segmentId: segment.id });
    } else {
      checks.push({ level: 'pass', title: `${segment.name} has a power assumption`, detail: `${amps.toFixed(1)} A estimated at the set brightness.`, segmentId: segment.id });
    }
    if (!layout.controllers.some((controller) => controller.id === segment.controllerId)) {
      checks.push({ level: 'warn', title: `${segment.name} has no controller`, detail: 'Assign a controller before wiring data.', segmentId: segment.id });
    }
  }
  const supplyAmps = layout.supplies.reduce((sum, supply) => sum + supply.amps, 0);
  const needed = totalCurrent(layout) * 1.2;
  if (!layout.supplies.length) {
    checks.push({ level: 'warn', title: 'No supply placed', detail: 'Place a supply and set its available current.' });
  } else if (supplyAmps < needed) {
    checks.push({ level: 'warn', title: 'Supply headroom is low', detail: `${supplyAmps.toFixed(1)} A stated; ${needed.toFixed(1)} A includes 20% headroom.` });
  } else {
    checks.push({ level: 'pass', title: 'Supply headroom is stated', detail: `${supplyAmps.toFixed(1)} A available for a ${needed.toFixed(1)} A target.` });
  }
  return checks;
}
