import Phaser from 'phaser';
import type { ItemKind } from '../items/itemTypes';
import { ITEM_PICKUP_COLORS, ITEM_PICKUP_LABELS } from '../items/ItemPickupFeedback';
import { BOOSTER_FEEDBACK_COLOR, BOOSTER_FEEDBACK_LABEL } from '../booster/BoosterFeedback';

type EffectKind = 'dust' | 'pickup' | 'crash' | 'booster';

export interface RunEffectsDebugSnapshot {
  dustPoolSize: number;
  pickupPoolSize: number;
  crashPoolSize: number;
  boosterPoolSize: number;
  activeCount: number;
  hasPersistentTrail: false;
}

interface PooledVisual {
  object: Phaser.GameObjects.Container;
  shape: Phaser.GameObjects.Graphics;
  label?: Phaser.GameObjects.Text;
  kind: EffectKind;
  ageMs: number;
  durationMs: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
}

export class RunEffects {
  private readonly dustPool: PooledVisual[];
  private readonly pickupPool: PooledVisual[];
  private readonly crashPool: PooledVisual[];
  private readonly boosterPool: PooledVisual[];
  private readonly pools: readonly PooledVisual[][];
  private dustIndex = 0;
  private pickupIndex = 0;
  private crashIndex = 0;
  private boosterIndex = 0;

  public constructor(private readonly scene: Phaser.Scene) {
    this.dustPool = this.createPool('dust', 12);
    this.pickupPool = this.createPool('pickup', 8);
    this.crashPool = this.createPool('crash', 16);
    this.boosterPool = this.createPool('booster', 2);
    this.pools = [this.dustPool, this.pickupPool, this.crashPool, this.boosterPool];
  }

  public update(deltaMs: number): void {
    const delta = Math.max(0, deltaMs);
    this.pools.forEach((pool) => pool.forEach((visual) => this.updateVisual(visual, delta)));
  }

  public emitRunDust(x: number, y: number): void {
    const visual = this.next(this.dustPool, () => this.dustIndex++);
    this.activate(visual, x, y, 240, -18, -6, 0.25);
    visual.object.setScale(0.8);
  }

  public emitLanding(x: number, y: number): void {
    const visual = this.next(this.dustPool, () => this.dustIndex++);
    this.activate(visual, x, y + 35, 300, -10, -24, 0);
    visual.object.setScale(1.1);
  }

  public emitPickup(kind: ItemKind, x: number, y: number): void {
    const visual = this.next(this.pickupPool, () => this.pickupIndex++);
    visual.shape.clear();
    visual.shape.lineStyle(3, Phaser.Display.Color.HexStringToColor(ITEM_PICKUP_COLORS[kind]).color, 1);
    visual.shape.strokeCircle(0, 0, 15);
    visual.label?.setText(ITEM_PICKUP_LABELS[kind]).setColor(ITEM_PICKUP_COLORS[kind]);
    this.activate(visual, x, y, 360, 0, -46, 0);
  }

  public emitBooster(x: number, y: number): void {
    const visual = this.next(this.boosterPool, () => this.boosterIndex++);
    visual.shape.clear();
    visual.shape.lineStyle(3, Phaser.Display.Color.HexStringToColor(BOOSTER_FEEDBACK_COLOR).color, 1);
    visual.shape.strokeCircle(0, 0, 42);
    visual.label?.setText(BOOSTER_FEEDBACK_LABEL).setColor(BOOSTER_FEEDBACK_COLOR);
    this.activate(visual, x, y - 40, 650, 0, -18, 0);
    visual.object.setScale(0.9);
  }

  public emitCrash(x: number, y: number): void {
    this.crashPool.forEach((visual, index) => {
      this.activate(visual, x, y, 420, Math.cos(index * 0.42) * 105, Math.sin(index * 0.42) * 105, index % 2 === 0 ? 1.5 : -1.5);
      visual.object.setRotation(index * 0.42);
    });
    this.scene.cameras.main.shake(220, 0.006);
  }

  public reset(): void {
    this.pools.forEach((pool) => pool.forEach((visual) => visual.object.setVisible(false)));
    this.dustIndex = 0;
    this.pickupIndex = 0;
    this.crashIndex = 0;
    this.boosterIndex = 0;
  }

  public getDebugSnapshot(): RunEffectsDebugSnapshot {
    return {
      dustPoolSize: this.dustPool.length,
      pickupPoolSize: this.pickupPool.length,
      crashPoolSize: this.crashPool.length,
      boosterPoolSize: this.boosterPool.length,
      activeCount: this.pools.reduce((count, pool) => count + pool.filter((visual) => visual.object.visible).length, 0),
      hasPersistentTrail: false,
    };
  }

  public destroy(): void {
    this.pools.forEach((pool) => pool.forEach((visual) => visual.object.destroy()));
  }

  private createPool(kind: EffectKind, count: number): PooledVisual[] {
    return Array.from({ length: count }, () => {
      const object = new Phaser.GameObjects.Container(this.scene, 0, 0);
      const shape = new Phaser.GameObjects.Graphics(this.scene);
      object.add(shape);
      let label: Phaser.GameObjects.Text | undefined;
      if (kind === 'pickup' || kind === 'booster') {
        label = this.scene.make.text({ x: 0, y: 0, text: '', add: false, style: {
          color: '#ffffff', fontFamily: 'Arial, sans-serif', fontSize: kind === 'booster' ? '32px' : '16px', fontStyle: 'bold', stroke: '#07111f', strokeThickness: 4,
        } }).setOrigin(0.5);
        object.add(label);
      }
      object.setDepth(kind === 'crash' ? 11 : 12).setVisible(false);
      this.scene.add.existing(object);
      if (kind === 'dust') {
        shape.fillStyle(0xd9e4ef, 0.7);
        shape.fillEllipse(-7, 1, 12, 6);
        shape.fillEllipse(6, -2, 9, 5);
      } else if (kind === 'crash') {
        shape.lineStyle(3, 0xffffbd, 1);
        shape.lineBetween(0, 0, 22, 0);
      }
      return { object, shape, label, kind, ageMs: 0, durationMs: 1, velocityX: 0, velocityY: 0, rotationSpeed: 0 };
    });
  }

  private next(pool: PooledVisual[], increment: () => number): PooledVisual {
    return pool[increment() % pool.length];
  }

  private activate(visual: PooledVisual, x: number, y: number, durationMs: number, velocityX: number, velocityY: number, rotationSpeed: number): void {
    visual.object.setPosition(x, y).setVisible(true).setAlpha(1).setScale(1);
    visual.ageMs = 0;
    visual.durationMs = durationMs;
    visual.velocityX = velocityX;
    visual.velocityY = velocityY;
    visual.rotationSpeed = rotationSpeed;
  }

  private updateVisual(visual: PooledVisual, delta: number): void {
    if (!visual.object.visible) return;
    visual.ageMs += delta;
    const progress = Math.min(1, visual.ageMs / visual.durationMs);
    visual.object.x += visual.velocityX * delta / 1000;
    visual.object.y += visual.velocityY * delta / 1000;
    visual.object.rotation += visual.rotationSpeed * delta / 1000;
    visual.object.setAlpha(1 - progress);
    visual.object.setScale(0.82 + progress * 0.45);
    if (progress >= 1) visual.object.setVisible(false);
  }
}
