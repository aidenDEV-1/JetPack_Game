import { describe, expect, it } from 'vitest';
import { resolveObstacleCollision } from '../CollisionResolver';

describe('obstacle collision priority', () => {
  it('prioritizes booster invincibility over shield', () => {
    expect(resolveObstacleCollision({ invincible: true, hasShield: true })).toBe('ignored-by-booster');
  });

  it('uses one shield hit before crashing', () => {
    expect(resolveObstacleCollision({ invincible: false, hasShield: true })).toBe('blocked-by-shield');
    expect(resolveObstacleCollision({ invincible: false, hasShield: false })).toBe('crash');
  });
});
