export type ObstacleKind = 'vertical-laser' | 'horizontal-laser' | 'missile' | 'monster';

export interface ObstaclePattern {
  id: string;
  kind: ObstacleKind;
  requiresShield: boolean;
  warningArrow: boolean;
  width: number;
  height: number;
  displayWidth: number;
  displayHeight: number;
  accentColor: number;
  warningColor: number;
}

export interface SpawnContext {
  distanceMeters: number;
  speed: number;
  hasShieldPickupAhead: boolean;
  forcedPatternUsedInSegment: boolean;
}

export interface PlayableGap { startY: number; endY: number; }
