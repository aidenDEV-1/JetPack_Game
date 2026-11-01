import { gameAssetDefinitions } from '../content/assets/gameAssets';

export interface AssetDefinition {
  key: string;
  path: string;
  kind: 'image' | 'spritesheet' | 'audio';
  frameWidth?: number;
  frameHeight?: number;
  frameCount?: number;
}

export const assetRegistry: AssetDefinition[] = gameAssetDefinitions;
