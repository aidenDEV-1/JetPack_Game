import type { ItemKind } from './itemTypes';

export const MIN_SHIELD_DISTANCE = 1100;
export const SHIELD_COOLDOWN_DISTANCE = 1200;

export function getSpawnInterval(kind: ItemKind, random: () => number = Math.random): number {
  if (kind === 'coin') return 280 + random() * 140;
  if (kind === 'token') return 500 + random() * 400;
  return 0;
}

export function getNextShieldDistance(currentDistance: number, random: () => number = Math.random): number {
  if (currentDistance < MIN_SHIELD_DISTANCE) return MIN_SHIELD_DISTANCE;
  return currentDistance + SHIELD_COOLDOWN_DISTANCE + random() * 600;
}

