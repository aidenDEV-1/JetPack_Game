import Phaser from 'phaser';
import { gameAssetKeys } from '../../content/assets/gameAssets';
import { WORLD_TUNING } from '../../game/config/tuning/world';
import type { CoworkerNpcSnapshot, CoworkerReaction } from './coworkerNpcTypes';

export class CoworkerNpcEntity extends Phaser.GameObjects.Container {
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly baseY: number;
  private reaction: CoworkerReaction = 'walk';
  private reactionOffsetY = 0;
  private reactionTween?: Phaser.Tweens.Tween;
  private walkElapsedMs = 0;

  public constructor(scene: Phaser.Scene, id: string, x: number, floorY: number) {
    super(scene, x, floorY - WORLD_TUNING.coworker.floorOffsetPx);
    this.name = id;
    this.baseY = floorY - WORLD_TUNING.coworker.floorOffsetPx;
    this.sprite = scene.make.sprite({ key: gameAssetKeys.coworkerNpcSheet, frame: 0, add: false })
      .setOrigin(0.5, 1)
      .setDisplaySize(
        WORLD_TUNING.coworker.displayHeight * WORLD_TUNING.coworker.frameWidth / WORLD_TUNING.coworker.frameHeight,
        WORLD_TUNING.coworker.displayHeight,
      );
    this.add(this.sprite);
    this.setDepth(-1).setVisible(false);
    scene.add.existing(this);
  }

  public activate(x: number): void {
    this.x = x;
    this.y = this.baseY;
    this.reactionOffsetY = 0;
    this.reaction = 'walk';
    this.walkElapsedMs = 0;
    this.setAngle(0).setAlpha(1).setVisible(true);
    this.sprite.setFrame(0);
  }

  public deactivate(): void {
    this.reactionTween?.stop();
    this.setVisible(false);
  }

  public update(deltaMs: number, worldSpeed: number): void {
    if (!this.visible) return;
    this.x -= worldSpeed * WORLD_TUNING.coworker.scrollFactor * Math.max(0, deltaMs) / 1000;
    this.y = this.baseY + this.reactionOffsetY;
    if (this.reaction === 'walk') {
      this.walkElapsedMs += Math.max(0, deltaMs);
      this.sprite.setFrame(Math.floor(this.walkElapsedMs / 150) % 4);
    }
  }

  public reactToPlayer(kind: 'booster' | 'landing' | 'proximity'): void {
    if (!this.visible || this.reaction === 'startled' || this.reaction === 'duck') return;
    this.reaction = kind === 'booster' ? 'duck' : 'startled';
    this.sprite.setFrame(kind === 'booster' ? 3 : 2);
    this.reactionTween?.stop();
    this.reactionTween = this.scene.tweens.add({
      targets: this,
      reactionOffsetY: kind === 'booster' ? WORLD_TUNING.coworker.reactionLiftPx : -WORLD_TUNING.coworker.reactionLiftPx,
      angle: kind === 'booster' ? -8 : 8,
      duration: WORLD_TUNING.coworker.reactionDurationMs / 2,
      yoyo: true,
      hold: WORLD_TUNING.coworker.reactionDurationMs / 3,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.reaction = 'recover';
        this.reactionOffsetY = 0;
        this.setAngle(0);
        this.reaction = 'walk';
      },
    });
  }

  public getSnapshot(): CoworkerNpcSnapshot {
    return {
      id: this.name,
      x: this.x,
      y: this.y,
      reaction: this.reaction,
      collisionEnabled: false,
    };
  }
}
