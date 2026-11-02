import { describe, expect, it } from 'vitest';
import { resolveLaserGeometry } from './laserSpanResolver';

const viewport = { width: 1280, ceilingY: 90, floorY: 625 };

describe('laser span resolver', () => {
  it('resolves full vertical and horizontal spans from the viewport', () => {
    const vertical = resolveLaserGeometry({ orientation: 'vertical', mode: 'full', margin: 0 }, viewport, () => 0.5);
    const horizontal = resolveLaserGeometry({ orientation: 'horizontal', mode: 'full', margin: 24 }, viewport, () => 0.5);

    expect(vertical).toMatchObject({ length: 535, collisionLength: 535, start: -267.5, end: 267.5 });
    expect(horizontal).toMatchObject({ length: 1328, collisionLength: 1328, start: -664, end: 664 });
  });

  it('keeps fixed spans and random spans within their requested bounds', () => {
    const fixed = resolveLaserGeometry({ orientation: 'horizontal', mode: 'fixed', length: 360, margin: 0 }, viewport, () => 0.5);
    const random = resolveLaserGeometry({ orientation: 'vertical', mode: 'random', minLength: 220, maxLength: 400, margin: 0 }, viewport, () => 0.5);

    expect(fixed.length).toBe(360);
    expect(random.length).toBe(310);
  });

  it('selects the full span when fullSpanChance is one', () => {
    const resolved = resolveLaserGeometry({ orientation: 'vertical', mode: 'random', minLength: 220, maxLength: 400, fullSpanChance: 1, margin: 0 }, viewport, () => 0.99);
    expect(resolved.length).toBe(535);
  });

  it('rejects incomplete fixed and random span definitions', () => {
    expect(() => resolveLaserGeometry({ orientation: 'vertical', mode: 'fixed', margin: 0 }, viewport, () => 0.5)).toThrow();
    expect(() => resolveLaserGeometry({ orientation: 'horizontal', mode: 'random', minLength: 420, maxLength: 200, margin: 0 }, viewport, () => 0.5)).toThrow();
  });
});
