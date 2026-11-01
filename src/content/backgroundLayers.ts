import { gameAssetKeys } from './assets/gameAssets';
import type { BackgroundSceneKey } from './backgroundSegments';

export interface BackgroundLayerDefinition {
  id: 'far' | 'mid' | 'near';
  depth: number;
  repeatWidth: number;
  scrollFactor: number;
  height: number;
  y: number;
  alpha: number;
  assetKeyByScene: Record<BackgroundSceneKey, string>;
}

const assetKeysForLayer = (layer: 'far' | 'mid' | 'near'): Record<BackgroundSceneKey, string> => ({
  office: gameAssetKeys.backgrounds.office[layer],
  security: gameAssetKeys.backgrounds.security[layer],
  city: gameAssetKeys.backgrounds.city[layer],
  'subway-entrance': gameAssetKeys.backgrounds['subway-entrance'][layer],
  'subway-inside': gameAssetKeys.backgrounds['subway-inside'][layer],
  'subway-exit': gameAssetKeys.backgrounds['subway-exit'][layer],
  rooftop: gameAssetKeys.backgrounds.rooftop[layer],
});

export const backgroundLayerDefinitions: readonly BackgroundLayerDefinition[] = [
  { id: 'far', depth: -12, repeatWidth: 1280, scrollFactor: 0.18, height: 720, y: 360, alpha: 0.78, assetKeyByScene: assetKeysForLayer('far') },
  { id: 'mid', depth: -11, repeatWidth: 1280, scrollFactor: 0.42, height: 720, y: 360, alpha: 0.42, assetKeyByScene: assetKeysForLayer('mid') },
  { id: 'near', depth: -10, repeatWidth: 1280, scrollFactor: 0.75, height: 720, y: 360, alpha: 0.28, assetKeyByScene: assetKeysForLayer('near') },
];

