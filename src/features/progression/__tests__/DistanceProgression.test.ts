import { describe, expect, it } from 'vitest';
import { getProgression, getWorldSpeed } from '../DistanceProgression';

describe('distance progression', () => {
  it('switches segments at exact 1000m boundaries', () => {
    expect(getProgression(999).segmentIndex).toBe(0);
    expect(getProgression(1000).segmentIndex).toBe(1);
    expect(getProgression(4000).segmentIndex).toBe(4);
    expect(getProgression(10000).segmentIndex).toBe(4);
  });

  it('increases speed continuously and caps after 5000m', () => {
    expect(getProgression(0).speedMultiplier).toBe(1);
    expect(getProgression(1000).speedMultiplier).toBeCloseTo(1.15);
    expect(getProgression(999.99).speedMultiplier).toBeLessThan(getProgression(1000).speedMultiplier);
    expect(getProgression(1000).speedMultiplier).toBeLessThan(getProgression(1000.01).speedMultiplier);
    expect(getProgression(Number.NaN).distanceMeters).toBe(0);
    expect(getWorldSpeed(5000)).toBe(getWorldSpeed(10000));
  });
});
