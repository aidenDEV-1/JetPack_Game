export type PlayerAnimation = 'running' | 'flying' | 'falling' | 'boosting' | 'crashing' | 'fallen';

export interface PlayerConfig {
  x: number;
  floorY: number;
  maxHeightY: number;
  scale: number;
}

export interface PlayerVisualState {
  animation: PlayerAnimation;
  boosting: boolean;
  gray: boolean;
}

export interface PlayerCollisionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
