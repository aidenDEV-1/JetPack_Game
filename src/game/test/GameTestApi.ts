import type { RunState } from '../state/GameState';

export interface BoosterTestSnapshot {
  active: boolean;
  phase: string;
  playerX: number;
  worldSpeedMultiplier: number;
  remainingMs: number;
}

export interface GameTestApi {
  getSnapshot: () => RunState;
  spawnDemoItems: () => void;
  spawnDemoObstacle: () => void;
  activateBooster: () => void;
  deactivateBooster: () => void;
  forceCrash: () => void;
  getBoosterSnapshot?: () => BoosterTestSnapshot;
}

export function registerGameTestApi(api: GameTestApi): void {
  if (!import.meta.env.DEV) return;
  window.__5PM_RUSH_TEST_API__ = api;
}

export function clearGameTestApi(): void {
  if (!import.meta.env.DEV) return;
  delete window.__5PM_RUSH_TEST_API__;
}
