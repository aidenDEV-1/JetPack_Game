import { describe, expect, it } from 'vitest';
import { getNextShieldDistance, getSpawnInterval, MIN_SHIELD_DISTANCE, SHIELD_COOLDOWN_DISTANCE } from './collectibleSpawn';
import { getTokenPosition } from './movementPatterns';

describe('collectible spawn rules', () => {
  it('keeps shield pickup unavailable before 1100m and applies cooldown afterwards', () => {
    expect(getNextShieldDistance(0, () => 0.5)).toBe(MIN_SHIELD_DISTANCE);
    expect(getNextShieldDistance(1500, () => 0.5)).toBe(1500 + SHIELD_COOLDOWN_DISTANCE + 300);
  });

  it('keeps regular spawn intervals within their configured ranges', () => {
    expect(getSpawnInterval('coin', () => 0)).toBe(280);
    expect(getSpawnInterval('coin', () => 1)).toBe(420);
    expect(getSpawnInterval('token', () => 0.5)).toBe(700);
  });

  it('moves tokens away from their origin in a non-static pattern', () => {
    const origin = { x: 100, y: 300 };
    const start = getTokenPosition('orbit', origin, 0);
    const later = getTokenPosition('orbit', origin, 1000);
    expect(later).not.toEqual(start);
  });
});
