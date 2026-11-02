import { gameAssetKeys } from '../../content/assets/gameAssets';
import { PLAYER_JETPACK_ANCHOR } from '../player/playerAssetConfig';
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
      flame: { x: -92, y: 4 },
      sparks: { x: -96, y: 4 },
    },
    scaleX: 0.5,
    scaleY: 0.5,
    coinPrice: 0,
    defaultUnlocked: true,
  },
];

export function getBoosterStyle(id: BoosterStyleId): BoosterStyleDefinition {
  return boosterStyleCatalog.find((style) => style.id === id) ?? boosterStyleCatalog[0];
}
