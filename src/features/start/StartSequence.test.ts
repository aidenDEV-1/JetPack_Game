import { describe, expect, it, vi } from 'vitest';
import { StartSequence } from './StartSequence';

describe('start sequence', () => {
  it('moves from 4:59:59 to 5:00:00 and completes', async () => {
    vi.useFakeTimers();
    const clock: string[] = [];
    const complete = vi.fn();
    const sequence = new StartSequence({ onClockChange: (value) => clock.push(value), onAlarm: vi.fn(), onComplete: complete });
    const running = sequence.play();
    await vi.advanceTimersByTimeAsync(3100);
    await running;
    expect(clock).toEqual(['4:59:59', '5:00:00']);
    expect(complete).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
