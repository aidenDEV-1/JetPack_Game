import type { PlayerAnimation } from './playerTypes';

export const PLAYER_FRAME_WIDTH = 384;
export const PLAYER_FRAME_HEIGHT = 170;
export const PLAYER_FRAME_COUNT = 28;

export const PLAYER_ANIMATION_KEYS: Record<PlayerAnimation, string> = {
  running: 'player-running',
  takeoff: 'player-takeoff',
  flying: 'player-flying',
  falling: 'player-falling',
  landing: 'player-landing',
  hit: 'player-hit',
  dead: 'player-dead',
};

export const PLAYER_ANIMATION_RANGES: Record<PlayerAnimation, { start: number; end: number; frameRate: number; repeat: number }> = {
  running: { start: 0, end: 3, frameRate: 10, repeat: -1 },
  takeoff: { start: 4, end: 7, frameRate: 14, repeat: 0 },
  flying: { start: 8, end: 11, frameRate: 12, repeat: -1 },
  falling: { start: 12, end: 15, frameRate: 10, repeat: -1 },
  landing: { start: 16, end: 19, frameRate: 14, repeat: 0 },
  hit: { start: 20, end: 23, frameRate: 10, repeat: 0 },
  dead: { start: 24, end: 27, frameRate: 1, repeat: 0 },
};

export const PLAYER_SPRITE_SCALE = 0.5;
export const PLAYER_JETPACK_ANCHOR = { x: -78, y: 18 } as const;
export const PLAYER_COLLISION_BOUNDS = { x: -42, y: -30, width: 84, height: 68 } as const;

