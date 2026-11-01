export interface AssetDefinition {
  key: string;
  path: string;
  kind: 'image' | 'spritesheet' | 'audio';
}

export const assetRegistry: AssetDefinition[] = [];
