export type PlayerAnimation = 'running' | 'takeoff' | 'flying' | 'falling' | 'landing' | 'hit' | 'dead';

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

export interface PlayerMotionVisualInput {
  grounded: boolean;
  thrusting: boolean;
  boosterActive: boolean;
  deltaMs: number;
}

export interface PlayerCollisionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
