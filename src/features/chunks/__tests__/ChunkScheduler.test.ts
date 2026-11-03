import { describe, expect, it } from 'vitest';
import { ChunkScheduler } from '../ChunkScheduler';

describe('chunk scheduler', () => {
  it('only advances on distance thresholds and exposes a deterministic snapshot', () => {
    const scheduler = new ChunkScheduler();
    expect(scheduler.isDue(0)).toBe(true);
    expect(scheduler.next(0, () => 0).id).toBe('A');
    expect(scheduler.isDue(179)).toBe(false);
    expect(scheduler.isDue(180)).toBe(true);
    expect(scheduler.next(180, () => 0).id).toBe('A');
    expect(scheduler.snapshot()).toEqual({ activeChunkId: 'A', nextDistanceMeters: 360 });
  });

  it('selects only chunks eligible for the current distance interval', () => {
    const scheduler = new ChunkScheduler();
    scheduler.next(0, () => 0.99);
    scheduler.next(180, () => 0.99);
    scheduler.next(360, () => 0.99);
    scheduler.next(540, () => 0.99);
    expect(scheduler.next(720, () => 0.99).id).toBe('B');
  });
});
