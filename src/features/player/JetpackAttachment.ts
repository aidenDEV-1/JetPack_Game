import Phaser from 'phaser';
import type { BoosterStyleDefinition, BoosterStyleId } from '../booster/boosterStyleTypes';
import { gameAssetKeys } from '../../content/assets/gameAssets';
import { JetpackFlameVisual, type JetpackFlameIntensity } from './JetpackFlameVisual';
import { JetpackSparkEmitter } from './JetpackSparkEmitter';
import { BOOSTER_TUNING } from '../../game/config/tuning/booster';

export type BoosterFormMode = 'normal' | 'transforming-in' | 'boosting' | 'transforming-out';
export type JetpackActivity = 'off' | 'takeoff' | 'flying' | 'boosting';

export interface JetpackAttachmentConfig {
  style: BoosterStyleDefinition;
  anchor: { x: number; y: number };
}

export interface BoosterFormVisualSnapshot {
  styleId: BoosterStyleId;
  mode: BoosterFormMode;
  activity: JetpackActivity;
  rocketFormVisible: boolean;
  rocketFormParent: 'player-entity';
  flameVisible: boolean;
  flameParent: 'jetpack-attachment';
  sparkEmitterCount: number;
  hasPersistentTrail: false;
  hasDetachedBoosterRoot: false;
}

const MORPH_DURATION_MS = 140;

export class JetpackAttachment extends Phaser.GameObjects.Container {
  private readonly formSprite: Phaser.GameObjects.Sprite;
  private readonly flameVisual: JetpackFlameVisual;
  private readonly sparkEmitter: JetpackSparkEmitter;
  private style: BoosterStyleDefinition;
  private mode: BoosterFormMode = 'normal';
  private activity: JetpackActivity = 'off';

  public constructor(scene: Phaser.Scene, config: JetpackAttachmentConfig) {
    super(scene, config.anchor.x, config.anchor.y);
    this.style = config.style;
    this.formSprite = scene.make.sprite({
      key: config.style.textureKey,
      frame: config.style.frameStart,
      add: false,
    }).setScale(config.style.scaleX, config.style.scaleY);
    this.flameVisual = new JetpackFlameVisual(scene, gameAssetKeys.jetpackFlameSheet);
    this.sparkEmitter = new JetpackSparkEmitter(scene, gameAssetKeys.jetpackFlameSheet);
    this.add([this.flameVisual, this.sparkEmitter, this.formSprite]);
    this.formSprite.setVisible(false);
    this.applyStyleAnchors();
    this.ensureAnimation(scene);
  }

  public setStyle(style: BoosterStyleDefinition): void {
    this.setBoosting(false);
    this.style = style;
    this.formSprite.setTexture(style.textureKey, style.frameStart);
    this.formSprite.setScale(style.scaleX, style.scaleY);
    this.applyStyleAnchors();
    this.ensureAnimation(this.scene);
  }

  public setActivity(activity: JetpackActivity): void {
    if (this.activity === activity && (activity !== 'boosting' || this.mode === 'boosting' || this.mode === 'transforming-in')) return;
    this.activity = activity;
    if (activity === 'boosting') {
      this.showRocketForm();
    } else {
      this.hideRocketForm();
    }
    const active = activity !== 'off';
    const intensity: JetpackFlameIntensity = activity === 'boosting' || activity === 'takeoff' ? 'strong' : 'normal';
    this.flameVisual.setFlameActive(activity === 'takeoff' || activity === 'flying' || activity === 'boosting', intensity);
    this.sparkEmitter.setEmitterActive(active, activity === 'boosting' ? BOOSTER_TUNING.particleMultiplier : 1);
  }

  public setBoosterVisual(active: boolean): void {
    this.setActivity(active ? 'boosting' : 'off');
  }

  public setBoosting(active: boolean): void {
    this.setActivity(active ? 'boosting' : 'off');
  }

  public setGray(gray: boolean): void {
    this.formSprite.setTint(gray ? 0x707780 : 0xffffff);
    this.flameVisual.setTint(gray ? 0x707780 : 0xffffff);
    this.sparkEmitter.setAlpha(gray ? 0.5 : 1);
  }

  public getVisualSnapshot(): BoosterFormVisualSnapshot {
    return {
      styleId: this.style.id,
      mode: this.mode,
      activity: this.activity,
      rocketFormVisible: this.formSprite.visible,
      rocketFormParent: 'player-entity',
      flameVisible: this.flameVisual.visible || this.activity === 'boosting',
      flameParent: 'jetpack-attachment',
      sparkEmitterCount: this.sparkEmitter.getBoundedCount(),
      hasPersistentTrail: false,
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
    this.activity = 'off';
    this.flameVisual.reset();
    this.sparkEmitter.reset();
  }

  private showRocketForm(): void {
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
  }

  private hideRocketForm(): void {
    this.scene.tweens.killTweensOf(this.formSprite);
    this.formSprite.stop();
    if (this.formSprite.visible) this.mode = 'transforming-out';
    this.formSprite.setVisible(false);
    this.formSprite.setAlpha(1);
    this.formSprite.setScale(this.style.scaleX, this.style.scaleY);
    this.mode = 'normal';
  }

  private applyStyleAnchors(): void {
    this.flameVisual.setPosition(this.style.vfx.flame.x, this.style.vfx.flame.y);
    this.sparkEmitter.setPosition(this.style.vfx.sparks.x, this.style.vfx.sparks.y);
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
