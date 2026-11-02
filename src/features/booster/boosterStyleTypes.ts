export type BoosterStyleId = 'leather-rocket';

export interface BoosterStyleDefinition {
  id: BoosterStyleId;
  displayName: string;
  textureKey: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameStart: number;
  anchor: { x: number; y: number };
  scaleX: number;
  scaleY: number;
  coinPrice: number;
  defaultUnlocked: boolean;
}
