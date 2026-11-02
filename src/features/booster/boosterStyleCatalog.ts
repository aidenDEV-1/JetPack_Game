import { gameAssetKeys } from '../../content/assets/gameAssets';
import { PLAYER_JETPACK_ANCHOR } from '../player/playerAssetConfig';
import { GAME_CONFIG } from '../../game/config/gameConfig';
import type { BoosterStyleDefinition, BoosterStyleId } from './boosterStyleTypes';

export const DEFAULT_BOOSTER_STYLE_ID: BoosterStyleId = 'leather-rocket';

export const boosterStyleCatalog: readonly BoosterStyleDefinition[] = [
  {
    id: DEFAULT_BOOSTER_STYLE_ID,
    displayName: '가죽 로켓',
    textureKey: gameAssetKeys.boosterFormsSheet,
    frameWidth: 384,
    frameHeight: 170,
    frameCount: 4,
    frameStart: 0,
    anchor: PLAYER_JETPACK_ANCHOR,
    vfx: {
      flame: { x: Math.round(-GAME_CONFIG.playerHeight * 0.96), y: Math.round(GAME_CONFIG.playerHeight * 0.04) },
      sparks: { x: Math.round(-GAME_CONFIG.playerHeight * 1.0), y: Math.round(GAME_CONFIG.playerHeight * 0.04) },
    },
    scaleX: (GAME_CONFIG.playerHeight / 170) * 0.82,
    scaleY: (GAME_CONFIG.playerHeight / 170) * 0.82,
    coinPrice: 0,
    defaultUnlocked: true,
  },
];

export function getBoosterStyle(id: BoosterStyleId): BoosterStyleDefinition {
  return boosterStyleCatalog.find((style) => style.id === id) ?? boosterStyleCatalog[0];
}
