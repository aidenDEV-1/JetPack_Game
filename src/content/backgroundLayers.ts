import { gameAssetKeys } from './assets/gameAssets';
import type { BackgroundSceneKey } from './backgroundSegments';
import { BACKGROUND_TUNING } from '../game/config/tuning/background';

export interface BackgroundLayerDefinition {
  id: 'l0' | 'l1' | 'l2' | 'l3';
  depth: number;
  repeatWidth: number;
  scrollFactor: number;
  height: number;
  y: number;
  alpha: number;
  floorTopY: number | null;
  assetKeyByScene: Record<BackgroundSceneKey, string>;
}

const assetKeysForLayer = (layer: 'l0' | 'l1' | 'l2' | 'l3'): Record<BackgroundSceneKey, string> => ({
  office: gameAssetKeys.backgrounds.office[layer],
  security: gameAssetKeys.backgrounds.security[layer],
  city: gameAssetKeys.backgrounds.city[layer],
  'subway-entrance': gameAssetKeys.backgrounds['subway-entrance'][layer],
  'subway-inside': gameAssetKeys.backgrounds['subway-inside'][layer],
  'subway-exit': gameAssetKeys.backgrounds['subway-exit'][layer],
  rooftop: gameAssetKeys.backgrounds.rooftop[layer],
});

export const backgroundLayerDefinitions: readonly BackgroundLayerDefinition[] = (['l0', 'l1', 'l2', 'l3'] as const).map((id) => ({
  id,
  ...BACKGROUND_TUNING.layers[id],
  assetKeyByScene: assetKeysForLayer(id),
}));

