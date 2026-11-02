export type ObstacleKind = 'vertical-laser' | 'horizontal-laser' | 'missile' | 'monster';
export type ObstacleVisualId = 'security-drone' | 'electro-drone' | 'missile' | 'rotor';
export type ObstacleMotionType = 'straight' | 'hover' | 'sway' | 'spin';

export interface ObstacleMotionSpec {
  type: ObstacleMotionType;
  amplitudePx: number;
  periodMs: number;
  rotationDegPerSecond: number;
}

export type LaserOrientation = 'vertical' | 'horizontal';
export type LaserSpanMode = 'full' | 'fixed' | 'random';
export type LaserActivity = 'charging' | 'active';

export interface LaserSpanSpec {
  orientation: LaserOrientation;
  mode: LaserSpanMode;
  length?: number;
  minLength?: number;
  maxLength?: number;
  fullSpanChance?: number;
  margin: number;
}

export interface LaserVisualSpec {
  beamWidth: number;
  coreWidth: number;
  glowWidth: number;
  glowColor: number;
  beamColor: number;
  coreColor: number;
  emitterColor: number;
  emitterFrame: number;
  emitterWidth: number;
  emitterHeight: number;
  chargeDurationMs: number;
  sparkColor: number;
}

export interface ResolvedLaserGeometry {
  orientation: LaserOrientation;
  length: number;
  collisionLength: number;
  start: number;
  end: number;
  center: { x: number; y: number };
}

export interface ObstaclePattern {
  id: string;
  kind: ObstacleKind;
  visualId: ObstacleVisualId;
  motion: ObstacleMotionSpec;
  requiresShield: boolean;
  warningArrow: boolean;
  width: number;
  height: number;
  displayWidth: number;
  displayHeight: number;
  accentColor: number;
  warningColor: number;
  laserSpan?: LaserSpanSpec;
  laserVisual?: LaserVisualSpec;
}

export interface SpawnContext {
  distanceMeters: number;
  speed: number;
  hasShieldPickupAhead: boolean;
  forcedPatternUsedInSegment: boolean;
}

export interface PlayableGap { startY: number; endY: number; }
