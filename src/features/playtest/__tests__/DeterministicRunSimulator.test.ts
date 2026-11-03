import { describe, expect, it } from 'vitest';
import { simulateRun } from '../DeterministicRunSimulator';

describe('deterministic 30-second run simulation', () => {
  it('covers the first-play contract with a fixed seed', () => {
    const result = simulateRun(20261103, 30000);
    expect(result.durationMs).toBe(30000);
    expect(result.obstacleKinds.length).toBeGreaterThanOrEqual(3);
    expect(result.coinClusterCount).toBeGreaterThanOrEqual(4);
    expect(result.missileWarningCount).toBeGreaterThanOrEqual(1);
    expect(result.survived).toBe(true);
  });

  it('returns the same catalog result for the same seed', () => {
    expect(simulateRun(42)).toEqual(simulateRun(42));
  });
});
