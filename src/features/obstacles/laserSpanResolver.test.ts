import { describe, expect, it } from 'vitest';
import { resolveLaserGeometry } from './laserSpanResolver';

const viewport = { width: 1280, ceilingY: 90, floorY: 625 };

describe('laser span resolver', () => {
  it('keeps fixed spans and random spans within the playable bounds', () => {
    const fixed = resolveLaserGeometry({ orientation: 'horizontal', mode: 'fixed', length: 192, margin: 0 }, viewport, () => 0.5);
    const random = resolveLaserGeometry({ orientation: 'vertical', mode: 'random', minLength: 144, maxLength: 192, margin: 0 }, viewport, () => 0.5);

    expect(fixed).toMatchObject({ length: 192, collisionLength: 192, start: -96, end: 96 });
    expect(random.length).toBe(168);
    expect(random.collisionLength).toBe(random.length);
    expect(random.length).toBeGreaterThanOrEqual(144);
    expect(random.length).toBeLessThanOrEqual(192);
  });

  it('clamps fixed spans to the viewport without allowing a full-span pattern', () => {
    const resolved = resolveLaserGeometry({ orientation: 'vertical', mode: 'fixed', length: 900, margin: 0 }, viewport, () => 0.5);
    expect(resolved.length).toBe(535);
    expect(resolved.collisionLength).toBe(535);
  });

  it('rejects incomplete fixed and random span definitions', () => {
    expect(() => resolveLaserGeometry({ orientation: 'vertical', mode: 'fixed', margin: 0 }, viewport, () => 0.5)).toThrow();
    expect(() => resolveLaserGeometry({ orientation: 'horizontal', mode: 'random', minLength: 420, maxLength: 200, margin: 0 }, viewport, () => 0.5)).toThrow();
  });
});
