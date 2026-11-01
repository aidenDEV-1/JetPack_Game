import { describe, expect, it } from 'vitest';
import { backgroundSegments } from './backgroundSegments';

describe('initial background segments', () => {
  it('defines five distance-based themes in order', () => {
    expect(backgroundSegments).toHaveLength(5);
    expect(backgroundSegments.map((segment) => segment.startMeters)).toEqual([0, 1000, 2000, 3000, 4000]);
  });
});
