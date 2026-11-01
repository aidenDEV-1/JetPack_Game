import { describe, expect, it } from 'vitest';
import { resolveObstacleCollision } from '../CollisionResolver';
import { ObstacleSpawner } from '../ObstacleSpawner';

describe('obstacle field rules', () => {
  it('does not allow forced crossfire before 1100m', () => {
    const spawner = new ObstacleSpawner();
    expect(spawner.canUseForcedPattern({ distanceMeters: 1099, speed: 300, hasShieldPickupAhead: true, forcedPatternUsedInSegment: false })).toBe(false);
    expect(spawner.canUseForcedPattern({ distanceMeters: 1100, speed: 300, hasShieldPickupAhead: true, forcedPatternUsedInSegment: false })).toBe(true);
  });

  it('prioritizes booster, then one shield, then crash', () => {
    expect(resolveObstacleCollision({ invincible: true, hasShield: true })).toBe('ignored-by-booster');
    expect(resolveObstacleCollision({ invincible: false, hasShield: true })).toBe('blocked-by-shield');
    expect(resolveObstacleCollision({ invincible: false, hasShield: false })).toBe('crash');
  });
});
