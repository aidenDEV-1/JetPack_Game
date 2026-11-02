import type { PlayerAnimation } from './playerTypes';
import { GAME_CONFIG } from '../../game/config/gameConfig';
import { PLAYER_SHEET_META } from '../../content/assets/playerSheetMeta';

export const PLAYER_FRAME_WIDTH = PLAYER_SHEET_META.frameWidth;
export const PLAYER_FRAME_HEIGHT = PLAYER_SHEET_META.frameHeight;
export const PLAYER_FRAME_COUNT = PLAYER_SHEET_META.frameCount;
export const PLAYER_FRAME_GUTTER = PLAYER_SHEET_META.gutter;

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

export const PLAYER_HEIGHT = GAME_CONFIG.playerHeight;
export const PLAYER_SPRITE_SCALE = PLAYER_HEIGHT / PLAYER_FRAME_HEIGHT;
export const PLAYER_SPRITE_DISPLAY_SIZE = {
  width: PLAYER_FRAME_WIDTH * PLAYER_SPRITE_SCALE,
  height: PLAYER_HEIGHT,
} as const;
export const PLAYER_JETPACK_ANCHOR = { x: Math.round(-PLAYER_HEIGHT * 0.81), y: Math.round(PLAYER_HEIGHT * 0.19) } as const;
export const PLAYER_COLLISION_BOUNDS = {
  x: Math.round(-PLAYER_HEIGHT * 0.42),
  y: Math.round(-PLAYER_HEIGHT * 0.33),
  width: Math.round(PLAYER_HEIGHT * 0.82),
  height: Math.round(PLAYER_HEIGHT * 0.68),
} as const;

