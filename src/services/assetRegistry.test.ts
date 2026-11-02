import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { gameAssetKeys } from '../content/assets/gameAssets';
import { assetRegistry } from './assetRegistry';

const requiredKeys = [
  gameAssetKeys.playerSheet,
  gameAssetKeys.boosterFormsSheet,
  gameAssetKeys.itemsSheet,
  gameAssetKeys.obstaclesSheet,
  ...Object.values(gameAssetKeys.backgrounds).flatMap((scene) => Object.values(scene)),
];

function getAssetFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? getAssetFiles(path) : [path];
  });
}

describe('asset registry', () => {
  it('contains unique required keys with valid public paths', () => {
    expect(assetRegistry.length).toBeGreaterThanOrEqual(requiredKeys.length);
    expect(new Set(assetRegistry.map((asset) => asset.key)).size).toBe(assetRegistry.length);
    expect(assetRegistry.map((asset) => asset.key)).toEqual(expect.arrayContaining(requiredKeys));
    assetRegistry.forEach((asset) => {
      expect(asset.path.startsWith('/assets/')).toBe(true);
      expect(existsSync(resolve(process.cwd(), 'public', asset.path.slice(1)))).toBe(true);
    });
  });

  it('has positive frame metadata for every spritesheet', () => {
    assetRegistry.filter((asset) => asset.kind === 'spritesheet').forEach((asset) => {
      expect(asset.frameWidth).toBeGreaterThan(0);
      expect(asset.frameHeight).toBeGreaterThan(0);
      expect(asset.frameCount).toBeGreaterThan(0);
    });
  });

  it('does not contain original-photo-like files', () => {
    const files = getAssetFiles(resolve(process.cwd(), 'public/assets'));
    expect(files.some((file) => /(?:^|\/)(?:IMG_|photo|original|face)[^/]*$/i.test(file))).toBe(false);
  });
});

