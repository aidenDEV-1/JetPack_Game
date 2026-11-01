export type ItemKind = 'coin' | 'shield' | 'token';
export type TokenPattern = 'vertical' | 'horizontal' | 'wave' | 'orbit';

export interface ItemEntityContract {
  kind: ItemKind;
  pattern?: TokenPattern;
  collect(): boolean;
  isCollected(): boolean;
}

export interface ItemInventory {
  runCoins: number;
  tokenCount: number;
  hasShield: boolean;
}

export const emptyItemInventory = (): ItemInventory => ({ runCoins: 0, tokenCount: 0, hasShield: false });
