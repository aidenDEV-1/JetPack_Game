import { describe, expect, it } from 'vitest';
import { gameAssetDefinitions, gameAssetKeys } from '../../../content/assets/gameAssets';
import { DEFAULT_BOOSTER_STYLE_ID, boosterStyleCatalog, getBoosterStyle } from '../boosterStyleCatalog';

describe('booster style catalog', () => {
  it('provides an unlocked default leather rocket style', () => {
    const style = getBoosterStyle(DEFAULT_BOOSTER_STYLE_ID);

    expect(style).toMatchObject({
      id: 'leather-rocket',
      textureKey: gameAssetKeys.boosterFormsSheet,
      frameWidth: 384,
      frameHeight: 170,
      frameCount: 4,
      coinPrice: 0,
      defaultUnlocked: true,
    });
  });

  it('keeps style ids unique and points at registered assets', () => {
    expect(boosterStyleCatalog.length).toBeGreaterThan(0);
    expect(new Set(boosterStyleCatalog.map((style) => style.id)).size).toBe(boosterStyleCatalog.length);
    boosterStyleCatalog.forEach((style) => {
      expect(gameAssetDefinitions.some((asset) => asset.key === style.textureKey)).toBe(true);
      expect(style.frameStart + style.frameCount).toBeLessThanOrEqual(
        gameAssetDefinitions.find((asset) => asset.key === style.textureKey)?.frameCount ?? 0,
      );
    });
  });
});
