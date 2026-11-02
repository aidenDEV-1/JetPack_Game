import type { PlayerAnimation } from './playerTypes';

export const PLAYER_ANIMATION_KEYS: Record<PlayerAnimation, string> = {
  running: 'player-running',
  flying: 'player-flying',
  falling: 'player-falling',
  boosting: 'player-boosting',
  crashing: 'player-crashing',
  fallen: 'player-fallen',
};

export const PLAYER_SPRITE_SCALE = 0.5;
export const PLAYER_JETPACK_ANCHOR = { x: -78, y: 18 } as const;
export const PLAYER_COLLISION_BOUNDS = { x: -42, y: -30, width: 84, height: 68 } as const;

