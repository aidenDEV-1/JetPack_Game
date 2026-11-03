import type { RunState } from '../state/GameState';
import type { PlayerAnimation } from '../../features/player/playerTypes';
import type { JetpackActivity } from '../../features/player/JetpackAttachment';
import type { CoworkerNpcSnapshot } from '../../features/world/coworkerNpcTypes';
import type { RunDebugSnapshot } from '../../features/debug/RunDebugOverlay';

export interface BoosterTestSnapshot {
  active: boolean;
  phase: string;
  playerX: number;
  worldSpeedMultiplier: number;
  remainingMs: number;
  boosterPhase?: string;
  graceRemainingMs?: number;
  invincible?: boolean;
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
  toggleDebugOverlay?: () => boolean;
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
    jetpackActivity: JetpackActivity;
    boosterStyleId: string;
    boosterMode: string;
    rocketFormVisible: boolean;
    rocketFormParent: 'player-entity';
    flameParent: 'jetpack-attachment';
    sparkEmitterCount: number;
    hasDetachedBoosterRoot: false;
    bodyTextureKey: string;
  };
  getObstacleVisualSnapshot?: () => Array<{
    kind: string;
    visualId: string;
    motion: string;
    x: number;
    orientation?: 'vertical' | 'horizontal';
    spanMode?: 'full' | 'fixed' | 'random';
    activity?: 'charging' | 'active';
    beamWidth?: number;
    coreWidth?: number;
    glowWidth?: number;
    emitterCount?: number;
    resolvedLength?: number;
    collisionLength?: number;
    displayWidth: number;
    displayHeight: number;
    collisionBounds: Array<{ x: number; y: number; width: number; height: number }>;
    collisionCircles: Array<{ x: number; y: number; radius: number }>;
    warning: { visible: boolean; x: number; y: number; alpha: number; label: '← 위험' };
  }>;
  getEffectsSnapshot?: () => {
    dustPoolSize: number;
    pickupPoolSize: number;
    crashPoolSize: number;
    boosterPoolSize: number;
    activeCount: number;
    hasPersistentTrail: false;
    speedLinePoolSize: number;
    speedLineActiveCount: number;
  };
  getBackgroundSnapshot?: () => {
    scene: string;
    segment: number;
    transitionProgress: number;
  };
  getBoosterSnapshot?: () => BoosterTestSnapshot;
  getChunkSnapshot?: () => { activeChunkId: string | null; nextDistanceMeters: number };
  getCoworkerNpcSnapshot?: () => { poolSize: number; activeCount: number; snapshots: CoworkerNpcSnapshot[] };
  toggleRunDebugOverlay?: () => boolean;
  getDebugSnapshot?: () => RunDebugSnapshot;
  previewBackgroundAt?: (distanceMeters: number) => void;
}

export function registerGameTestApi(api: GameTestApi): void {
  if (!import.meta.env.DEV) return;
  window.__5PM_RUSH_TEST_API__ = api;
}

export function clearGameTestApi(): void {
  if (!import.meta.env.DEV) return;
  delete window.__5PM_RUSH_TEST_API__;
}
