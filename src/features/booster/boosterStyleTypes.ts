export type BoosterStyleId = 'leather-rocket';

export interface BoosterVfxAnchor {
  flame: { x: number; y: number };
  sparks: { x: number; y: number };
}

export interface BoosterStyleDefinition {
  id: BoosterStyleId;
  displayName: string;
  textureKey: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameStart: number;
  anchor: { x: number; y: number };
  vfx: BoosterVfxAnchor;
  scaleX: number;
  scaleY: number;
  coinPrice: number;
  defaultUnlocked: boolean;
}
