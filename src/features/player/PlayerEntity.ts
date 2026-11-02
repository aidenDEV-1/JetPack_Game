import Phaser from 'phaser';
import { gameAssetKeys } from '../../content/assets/gameAssets';
import { JetpackAttachment } from './JetpackAttachment';
import { PlayerAnimationController } from './playerAnimations';
import { PLAYER_ANIMATION_KEYS, PLAYER_COLLISION_BOUNDS, PLAYER_JETPACK_ANCHOR, PLAYER_SPRITE_SCALE } from './playerAssetConfig';
import type { PlayerAnimation, PlayerConfig, PlayerVisualState } from './playerTypes';

export interface PlayerVisualDebugSnapshot {
  collisionBounds: { x: number; y: number; width: number; height: number };
  jetpackAttachmentCount: number;
  hasPersistentTrail: boolean;
  flameVisible: boolean;
}

export class PlayerEntity extends Phaser.GameObjects.Container {
  private readonly controller = new PlayerAnimationController();
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly jetpack: JetpackAttachment;
  private currentAnimation: PlayerAnimation | null = null;
  private crashStarted = false;
  private readonly initialX: number;
  private readonly initialY: number;

  public constructor(scene: Phaser.Scene, config: PlayerConfig) {
    super(scene, config.x, config.floorY - 74);
    scene.add.existing(this);
    this.initialX = config.x;
    this.initialY = config.floorY - 74;
    this.setScale(config.scale);

    this.jetpack = new JetpackAttachment(scene, {
      textureKey: gameAssetKeys.boosterVfxSheet,
      flameFrame: 0,
      anchor: PLAYER_JETPACK_ANCHOR,
      scaleX: 0.24,
      scaleY: 0.34,
    });
    this.sprite = scene.add.sprite(0, 0, gameAssetKeys.playerSheet, 0).setScale(PLAYER_SPRITE_SCALE);
    this.add([this.jetpack, this.sprite]);
    this.setAnimation('running');
  }

  public setAnimation(state: PlayerAnimation): void {
    this.controller.setAnimation(state);
    const visual = this.controller.snapshot();
    this.applyAnimation(visual.animation);
    this.jetpack.setActive(visual.boosting && !visual.gray);
    this.jetpack.setGray(visual.gray);
    this.applyGray(visual.gray);
  }

  public setBoosting(value: boolean): void {
    this.controller.setBoosting(value);
    const visual = this.controller.snapshot();
    this.applyAnimation(visual.animation);
    this.jetpack.setActive(visual.boosting && !visual.gray);
    this.jetpack.setGray(visual.gray);
    this.applyGray(visual.gray);
  }

  public getVisualState(): PlayerVisualState { return this.controller.snapshot(); }

  public getVisualDebugSnapshot(): PlayerVisualDebugSnapshot {
    const bounds = this.getCollisionBounds();
    return {
      collisionBounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
      jetpackAttachmentCount: 1,
      hasPersistentTrail: false,
      flameVisible: this.jetpack.visible,
    };
  }

  public getCollisionBounds(): Phaser.Geom.Rectangle {
    const scale = this.scaleX;
    return new Phaser.Geom.Rectangle(
      this.x + PLAYER_COLLISION_BOUNDS.x * scale,
      this.y + PLAYER_COLLISION_BOUNDS.y * scale,
      PLAYER_COLLISION_BOUNDS.width * scale,
      PLAYER_COLLISION_BOUNDS.height * scale,
    );
  }

  public async crash(): Promise<void> {
    if (this.crashStarted || !this.controller.beginCrash()) return;
    this.crashStarted = true;
    this.applyAnimation('crashing');
    this.jetpack.setActive(false);
    await new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: this,
        angle: 1080,
        y: this.y + 40,
        duration: 1200,
        ease: 'Cubic.easeIn',
        onComplete: () => resolve(),
      });
    });
    this.controller.finishCrash();
    this.setAnimation('fallen');
  }

  public reset(): void {
    this.scene.tweens.killTweensOf(this);
    this.x = this.initialX;
    this.y = this.initialY;
    this.angle = 0;
    this.crashStarted = false;
    this.controller.reset();
    this.currentAnimation = null;
    this.jetpack.reset();
    this.setAnimation('running');
    this.setBoosting(false);
  }

  private applyAnimation(state: PlayerAnimation): void {
    if (this.currentAnimation === state) return;
    this.sprite.play(PLAYER_ANIMATION_KEYS[state], true);
    this.currentAnimation = state;
  }

  private applyGray(gray: boolean): void {
    this.sprite.setTint(gray ? 0x7e8791 : 0xffffff);
    this.jetpack.setGray(gray);
  }
}

