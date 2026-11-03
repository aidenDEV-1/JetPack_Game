import type { ItemKind } from './itemTypes';
import { ITEM_TUNING } from '../../game/config/tuning/items';

export const MIN_SHIELD_DISTANCE = ITEM_TUNING.minimumShieldDistanceMeters;
export const SHIELD_COOLDOWN_DISTANCE = ITEM_TUNING.shieldCooldownDistanceMeters;

export function getSpawnInterval(kind: ItemKind, random: () => number = Math.random): number {
  if (kind === 'coin') return ITEM_TUNING.coinIntervalMinMeters + random() * ITEM_TUNING.coinIntervalRandomMeters;
  if (kind === 'token') return ITEM_TUNING.tokenIntervalMinMeters + random() * ITEM_TUNING.tokenIntervalRandomMeters;
  return 0;
}

export function getNextShieldDistance(currentDistance: number, random: () => number = Math.random): number {
  if (currentDistance < MIN_SHIELD_DISTANCE) return MIN_SHIELD_DISTANCE;
  return currentDistance + SHIELD_COOLDOWN_DISTANCE + random() * ITEM_TUNING.shieldRandomDistanceMeters;
}

