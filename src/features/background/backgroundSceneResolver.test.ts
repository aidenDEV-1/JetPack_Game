import { describe, expect, it } from 'vitest';
import { resolveBackgroundScene, resolveBackgroundSegmentIndex } from '../../content/backgroundSegments';

describe('background scene resolver', () => {
  it('uses the five requested distance segments', () => {
    expect(resolveBackgroundScene(-10)).toBe('office');
    expect(resolveBackgroundScene(0)).toBe('office');
    expect(resolveBackgroundScene(999.99)).toBe('office');
    expect(resolveBackgroundScene(1000)).toBe('security');
    expect(resolveBackgroundScene(2000)).toBe('city');
    expect(resolveBackgroundScene(3000)).toBe('subway-entrance');
    expect(resolveBackgroundScene(3500)).toBe('subway-inside');
    expect(resolveBackgroundScene(3999.99)).toBe('subway-exit');
    expect(resolveBackgroundScene(4000)).toBe('rooftop');
  });

  it('caps segment index at the final scene', () => {
    expect(resolveBackgroundSegmentIndex(0)).toBe(0);
    expect(resolveBackgroundSegmentIndex(2999)).toBe(2);
    expect(resolveBackgroundSegmentIndex(99999)).toBe(4);
  });
});

