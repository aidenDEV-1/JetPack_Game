import { describe, expect, it } from 'vitest';
import { resolveObstacleCollision } from '../CollisionResolver';
import { ObstacleSpawner } from '../ObstacleSpawner';
import { intersectsObstacleGeometry } from '../obstacleCollisionGeometry';

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

  it('uses thin beam rectangles and circular emitter nodes as separate collision shapes', () => {
    const player = { x: 0, y: 0, width: 20, height: 20 };
    const beam = [{ x: 30, y: -2, width: 80, height: 4 }];
    const node = [{ x: 25, y: 10, radius: 6 }];
    expect(intersectsObstacleGeometry(player, 0, 0, beam, node)).toBe(true);
    expect(intersectsObstacleGeometry(player, 0, 0, beam, [{ x: 30, y: 10, radius: 3 }])).toBe(false);
  });
});
