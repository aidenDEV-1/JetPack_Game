import { describe, expect, it } from 'vitest';
import { MAX_SPEED_LINES } from './SpeedLineEffect';

describe('speed line effect', () => {
  it('keeps the visual pool bounded independently of run distance', () => {
    expect(MAX_SPEED_LINES).toBe(8);
    expect(MAX_SPEED_LINES).toBeLessThan(16);
  });
});
