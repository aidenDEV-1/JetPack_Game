import type { RunState } from '../state/GameState';
import type { PlayerAnimation } from '../../features/player/playerTypes';

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
  spawnDemoWarningObstacle?: () => void;
  spawnDemoLaser?: (patternId: string) => void;
  clearDemoObstacles?: () => void;
  activateBooster: () => void;
  deactivateBooster: () => void;
  forceCrash: () => void;
  getPlayerVisualSnapshot?: () => {
    collisionBounds: { x: number; y: number; width: number; height: number };
    animation: PlayerAnimation;
    spriteFrame: number;
    renderRootCount: number;
    playerChildCount: number;
    jetpackAttachmentCount: number;
    hasDebugBounds: boolean;
    hasPersistentTrail: boolean;
    flameVisible: boolean;
    boosterStyleId: string;
    boosterMode: string;
    rocketFormVisible: boolean;
    rocketFormParent: 'player-entity';
    hasDetachedBoosterRoot: false;
    bodyTextureKey: string;
  };
  getObstacleVisualSnapshot?: () => Array<{
    kind: string;
    x: number;
    orientation?: 'vertical' | 'horizontal';
    spanMode?: 'full' | 'fixed' | 'random';
    resolvedLength?: number;
    collisionLength?: number;
    displayWidth: number;
    displayHeight: number;
    collisionBounds: Array<{ x: number; y: number; width: number; height: number }>;
    warning: { visible: boolean; x: number; y: number; alpha: number; label: '← 위험' };
  }>;
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
