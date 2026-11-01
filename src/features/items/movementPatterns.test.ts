import { describe, expect, it } from 'vitest';
import { getTokenPosition, selectTokenPattern } from './movementPatterns';

describe('token movement patterns', () => {
  it('selects a deterministic pattern with seeded random input', () => {
    expect(selectTokenPattern(() => 0)).toBe('vertical');
    expect(selectTokenPattern(() => 0.99)).toBe('orbit');
  });

  it('moves orbit tokens around their origin', () => {
    const origin = { x: 100, y: 100 };
    const position = getTokenPosition('orbit', origin, 1000, 20);
    expect(position.x).not.toBe(origin.x);
    expect(position.y).not.toBe(origin.y);
  });
});
