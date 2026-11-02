import Phaser from 'phaser';
import type { BoosterStyleDefinition, BoosterStyleId } from '../booster/boosterStyleTypes';

export type BoosterFormMode = 'normal' | 'transforming-in' | 'boosting' | 'transforming-out';

export interface JetpackAttachmentConfig {
  style: BoosterStyleDefinition;
  anchor: { x: number; y: number };
}

export interface BoosterFormVisualSnapshot {
  styleId: BoosterStyleId;
  mode: BoosterFormMode;
  rocketFormVisible: boolean;
  rocketFormParent: 'player-entity';
  hasDetachedBoosterRoot: false;
}

const MORPH_DURATION_MS = 140;

export class JetpackAttachment extends Phaser.GameObjects.Container {
  private readonly formSprite: Phaser.GameObjects.Sprite;
  private style: BoosterStyleDefinition;
  private mode: BoosterFormMode = 'normal';

  public constructor(scene: Phaser.Scene, config: JetpackAttachmentConfig) {
    super(scene, config.anchor.x, config.anchor.y);
    this.style = config.style;
    this.formSprite = scene.make.sprite({
      key: config.style.textureKey,
      frame: config.style.frameStart,
      add: false,
    }).setScale(config.style.scaleX, config.style.scaleY);
    this.add(this.formSprite);
    this.formSprite.setVisible(false);
    this.ensureAnimation(scene);
  }

  public setStyle(style: BoosterStyleDefinition): void {
    this.setBoosting(false);
    this.style = style;
    this.formSprite.setTexture(style.textureKey, style.frameStart);
    this.formSprite.setScale(style.scaleX, style.scaleY);
    this.ensureAnimation(this.scene);
  }

  public setBoosting(active: boolean): void {
    if (active) {
      if (this.mode === 'boosting' || this.mode === 'transforming-in') return;
      this.scene.tweens.killTweensOf(this.formSprite);
      this.mode = 'transforming-in';
      this.formSprite.stop();
      this.formSprite.setFrame(this.style.frameStart);
      this.formSprite.setVisible(true);
      this.formSprite.setAlpha(0);
      this.formSprite.setScale(this.style.scaleX * 0.88, this.style.scaleY * 0.88);
      this.scene.tweens.add({
        targets: this.formSprite,
        alpha: 1,
        scaleX: this.style.scaleX,
        scaleY: this.style.scaleY,
        duration: MORPH_DURATION_MS,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          this.mode = 'boosting';
          this.formSprite.play(this.animationKey(), true);
        },
      });
      return;
    }
    this.scene.tweens.killTweensOf(this.formSprite);
    this.formSprite.stop();
    this.mode = 'transforming-out';
    this.formSprite.setVisible(false);
    this.formSprite.setAlpha(1);
    this.formSprite.setScale(this.style.scaleX, this.style.scaleY);
    this.mode = 'normal';
  }

  public setGray(gray: boolean): void {
    this.formSprite.setTint(gray ? 0x707780 : 0xffffff);
  }

  public getVisualSnapshot(): BoosterFormVisualSnapshot {
    return {
      styleId: this.style.id,
      mode: this.mode,
      rocketFormVisible: this.formSprite.visible,
      rocketFormParent: 'player-entity',
      hasDetachedBoosterRoot: false,
    };
  }

  public reset(): void {
    this.scene.tweens.killTweensOf(this.formSprite);
    this.formSprite.stop();
    this.formSprite.setFrame(this.style.frameStart);
    this.formSprite.setVisible(false);
    this.formSprite.setAlpha(1);
    this.formSprite.setScale(this.style.scaleX, this.style.scaleY);
    this.setGray(false);
    this.mode = 'normal';
  }

  private animationKey(): string {
    return `booster-form-${this.style.id}`;
  }

  private ensureAnimation(scene: Phaser.Scene): void {
    if (scene.anims.exists(this.animationKey())) return;
    scene.anims.create({
      key: this.animationKey(),
      frames: scene.anims.generateFrameNumbers(this.style.textureKey, {
        start: this.style.frameStart,
        end: this.style.frameStart + this.style.frameCount - 1,
      }),
      frameRate: 16,
      repeat: -1,
    });
  }
}
