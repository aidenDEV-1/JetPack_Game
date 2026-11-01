import { describe, expect, it } from 'vitest';
import { ObstacleSpawner } from './ObstacleSpawner';
import { obstaclePatterns, isReachablePattern } from './obstaclePatterns';

describe('obstacle patterns', () => {
  it('only exposes the forced pattern after a shield pickup and once per segment', () => {
    const spawner = new ObstacleSpawner();
    expect(spawner.canUseForcedPattern({ distanceMeters: 1000, speed: 300, hasShieldPickupAhead: false, forcedPatternUsedInSegment: false })).toBe(false);
    expect(spawner.canUseForcedPattern({ distanceMeters: 1100, speed: 300, hasShieldPickupAhead: true, forcedPatternUsedInSegment: false })).toBe(true);
    const forced = spawner.choosePattern({ distanceMeters: 1100, speed: 300, hasShieldPickupAhead: true, forcedPatternUsedInSegment: false }, () => 0.99);
    expect(forced?.requiresShield).toBe(true);
    expect(spawner.canUseForcedPattern({ distanceMeters: 1000, speed: 300, hasShieldPickupAhead: true, forcedPatternUsedInSegment: false })).toBe(false);
  });

  it('never emits an unshielded forced pattern over a 10000m simulation', () => {
    const spawner = new ObstacleSpawner();
    for (let distance = 0; distance <= 10000; distance += 100) {
      const pattern = spawner.choosePattern({ distanceMeters: distance, speed: 300, hasShieldPickupAhead: distance >= 400, forcedPatternUsedInSegment: false }, () => 0.99);
      if (pattern?.requiresShield) expect(distance).toBeGreaterThanOrEqual(1100);
    }
  });

  it('requires a playable vertical gap for ordinary patterns', () => {
    expect(isReachablePattern([{ startY: 100, endY: 180 }])).toBe(false);
    expect(isReachablePattern([{ startY: 250, endY: 400 }])).toBe(true);
    expect(obstaclePatterns.filter((pattern) => pattern.warningArrow).map((pattern) => pattern.kind)).toEqual(['missile']);
  });
});
