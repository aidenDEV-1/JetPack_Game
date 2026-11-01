import { describe, expect, it } from 'vitest';
import { updateRunMotion } from './RunMotionSystem';

const base = { y: 300, velocityY: 0, deltaSeconds: 0.1, floorY: 625, ceilingY: 90, gravity: 1100, liftAcceleration: -1800, maxUpwardVelocity: -650, ceilingBounceVelocity: 120 };

describe('run motion', () => {
  it('ascends while thrusting and descends after release', () => {
    const rising = updateRunMotion({ ...base, thrusting: true });
    const falling = updateRunMotion({ ...base, y: 200, velocityY: 200, thrusting: false });
    expect(rising.y).toBeLessThan(base.y);
    expect(falling.y).toBeGreaterThan(200);
  });

  it('bounces at the ceiling without collision game over', () => {
    const result = updateRunMotion({ ...base, y: 95, velocityY: -200, thrusting: true });
    expect(result.y).toBe(90);
    expect(result.ceilingBounced).toBe(true);
    expect(result.velocityY).toBe(120);
  });

  it('lands on the floor and exposes grounded state', () => {
    const result = updateRunMotion({ ...base, y: 620, velocityY: 200, thrusting: false });
    expect(result.y).toBe(625);
    expect(result.grounded).toBe(true);
  });
});
