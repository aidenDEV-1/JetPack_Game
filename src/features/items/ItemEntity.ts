import Phaser from 'phaser';
import type { ItemEntityContract, ItemKind, TokenPattern } from './itemTypes';
import { getTokenPosition } from './movementPatterns';

export class ItemEntity extends Phaser.GameObjects.Container implements ItemEntityContract {
  public readonly kind: ItemKind;
  public readonly pattern?: TokenPattern;
  private collected = false;
  private readonly origin: { x: number; y: number };
  private readonly icon: Phaser.GameObjects.Arc;

  public constructor(scene: Phaser.Scene, kind: ItemKind, x: number, y: number, pattern?: TokenPattern) {
    super(scene, x, y);
    this.kind = kind;
    this.pattern = pattern;
    this.origin = { x, y };
    scene.add.existing(this);
    this.icon = scene.add.arc(0, 0, kind === 'token' ? 18 : 14, 0, 360, false, kind === 'coin' ? 0xf7c948 : kind === 'shield' ? 0x52c7ff : 0x0b3e8a);
    this.icon.setStrokeStyle(3, kind === 'token' ? 0xffffff : 0x183a5f);
    this.add(this.icon);
    if (kind === 'token') {
      const label = scene.add.text(0, 0, 'DEX.', { color: '#ffffff', fontSize: '8px', fontStyle: 'bold' }).setOrigin(0.5);
      this.add(label);
    }
  }

  public update(elapsedMs: number): void {
    if (this.collected || this.kind !== 'token' || !this.pattern) return;
    const position = getTokenPosition(this.pattern, this.origin, elapsedMs);
    this.x = position.x;
    this.y = position.y;
    this.angle += 1.2;
  }

  public collect(): boolean {
    if (this.collected) return false;
    this.collected = true;
    this.setVisible(false);
    return true;
  }

  public isCollected(): boolean { return this.collected; }
}
