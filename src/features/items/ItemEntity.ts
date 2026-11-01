import Phaser from 'phaser';
import { gameAssetKeys } from '../../content/assets/gameAssets';
import type { ItemEntityContract, ItemKind, TokenPattern } from './itemTypes';
import { getTokenPosition } from './movementPatterns';

const ITEM_FRAMES: Record<ItemKind, number> = { coin: 0, shield: 1, token: 2 };
const ITEM_SCALES: Record<ItemKind, number> = { coin: 0.095, shield: 0.105, token: 0.11 };

export class ItemEntity extends Phaser.GameObjects.Container implements ItemEntityContract {
  public readonly kind: ItemKind;
  public readonly pattern?: TokenPattern;
  private collected = false;
  private readonly origin: { x: number; y: number };
  private worldX: number;
  private elapsedMs = 0;
  private readonly icon: Phaser.GameObjects.Sprite;

  public constructor(scene: Phaser.Scene, kind: ItemKind, x: number, y: number, pattern?: TokenPattern) {
    super(scene, x, y);
    this.kind = kind;
    this.pattern = pattern;
    this.origin = { x, y };
    this.worldX = x;
    scene.add.existing(this);
    this.icon = scene.add.sprite(0, 0, gameAssetKeys.itemsSheet, ITEM_FRAMES[kind]).setScale(ITEM_SCALES[kind]);
    this.add(this.icon);
  }

  public update(deltaMs: number, worldSpeed: number, elapsedMs: number): void {
    if (this.collected) return;
    this.elapsedMs = elapsedMs;
    this.worldX -= worldSpeed * Math.max(0, deltaMs) / 1000;
    if (this.kind === 'token' && this.pattern) {
      const position = getTokenPosition(this.pattern, { x: this.worldX, y: this.origin.y }, elapsedMs, 42);
      this.x = position.x;
      this.y = position.y;
      this.angle = (elapsedMs / 12) % 360;
      return;
    }
    this.x = this.worldX;
  }

  public getCollisionBounds(): Phaser.Geom.Rectangle {
    const bounds = this.getBounds();
    const insetX = bounds.width * 0.12;
    const insetY = bounds.height * 0.12;
    return new Phaser.Geom.Rectangle(bounds.x + insetX, bounds.y + insetY, bounds.width - insetX * 2, bounds.height - insetY * 2);
  }

  public collect(): boolean {
    if (this.collected) return false;
    this.collected = true;
    this.setVisible(false);
    return true;
  }

  public isCollected(): boolean { return this.collected; }
  public getElapsedMs(): number { return this.elapsedMs; }
}

