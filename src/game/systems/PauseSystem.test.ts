import { describe, expect, it, vi } from 'vitest';
import { PauseSystem } from './PauseSystem';

describe('pause system', () => {
  it('requires a countdown before resuming', () => {
    vi.useFakeTimers();
    const system = new PauseSystem();
    const counts: number[] = [];
    const complete = vi.fn();
    system.pause();
    system.resumeWithCountdown((count) => counts.push(count), complete);
    expect(system.isPaused()).toBe(true);
    vi.advanceTimersByTime(3000);
    expect(counts).toEqual([3, 2, 1]);
    expect(complete).toHaveBeenCalledOnce();
    expect(system.isPaused()).toBe(false);
    vi.useRealTimers();
  });
});
