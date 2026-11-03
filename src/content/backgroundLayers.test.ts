import { describe, expect, it } from 'vitest';
import { GAME_CONFIG } from '../game/config/gameConfig';
import { backgroundLayerDefinitions } from './backgroundLayers';
import { gameAssetKeys } from './assets/gameAssets';

describe('office background layer contract', () => {
  it('registers independent L0-L3 assets with distinct parallax tuning', () => {
    expect(backgroundLayerDefinitions.map((layer) => layer.id)).toEqual(['l0', 'l1', 'l2', 'l3']);
    expect(new Set(backgroundLayerDefinitions.map((layer) => layer.assetKeyByScene.office)).size).toBe(4);
    expect(new Set(backgroundLayerDefinitions.map((layer) => layer.scrollFactor)).size).toBe(4);
    expect(backgroundLayerDefinitions.every((layer) => layer.repeatWidth === 1280)).toBe(true);
  });

  it('aligns the L3 floor contract with the gameplay floor', () => {
    const floor = backgroundLayerDefinitions.find((layer) => layer.id === 'l3');
    expect(floor?.floorTopY).toBe(GAME_CONFIG.floorY);
    expect(floor?.assetKeyByScene.office).toBe(gameAssetKeys.backgrounds.office.l3);
  });
});
