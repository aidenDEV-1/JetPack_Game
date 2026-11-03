import Phaser from 'phaser';
import { gameAssetKeys } from '../../content/assets/gameAssets';
import { GAME_CONFIG } from '../../game/config/gameConfig';
import { DEFAULT_BOOSTER_STYLE_ID, getBoosterStyle } from '../booster/boosterStyleCatalog';
import { JetpackAttachment } from './JetpackAttachment';
import type { BoosterFormMode, JetpackActivity } from './JetpackAttachment';
import { PlayerAnimationController } from './playerAnimations';
import { PLAYER_ANIMATION_KEYS, PLAYER_COLLISION_BOUNDS, PLAYER_JETPACK_ANCHOR, PLAYER_SPRITE_DISPLAY_SIZE, PLAYER_SPRITE_SCALE } from './playerAssetConfig';
import type { PlayerAnimation, PlayerConfig, PlayerMotionVisualInput, PlayerVisualState } from './playerTypes';

export interface PlayerVisualDebugSnapshot {
  collisionBounds: { x: number; y: number; width: number; height: number };
  animation: PlayerAnimation;
  spriteFrame: number;
  renderRootCount: number;
  playerChildCount: number;
  jetpackAttachmentCount: number;
  hasDebugBounds: boolean;
  hasPersistentTrail: boolean;
  flameVisible: boolean;
  boosterStyleId: string;
  boosterMode: BoosterFormMode;
  jetpackActivity: JetpackActivity;
  rocketFormVisible: boolean;
  rocketFormParent: 'player-entity';
  flameParent: 'jetpack-attachment';
  sparkEmitterCount: number;
  hasDetachedBoosterRoot: false;
  bodyTextureKey: string;
}

export class PlayerEntity extends Phaser.GameObjects.Container {
  private readonly controller = new PlayerAnimationController();
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly jetpack: JetpackAttachment;
  private currentAnimation: PlayerAnimation | null = null;
  private debugBounds?: Phaser.GameObjects.Graphics;
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
      style: getBoosterStyle(DEFAULT_BOOSTER_STYLE_ID),
      anchor: PLAYER_JETPACK_ANCHOR,
    });
    this.sprite = scene.make.sprite({ key: gameAssetKeys.playerSheet, frame: 0, add: false }).setScale(PLAYER_SPRITE_SCALE);
    this.add([this.jetpack, this.sprite]);
    this.setAnimation('running');
  }

  public setAnimation(state: PlayerAnimation): void {
    this.controller.setAnimation(state);
    const visual = this.controller.snapshot();
    this.applyAnimation(visual.animation);
    this.applyVisualState(visual);
  }

  public setBoosting(value: boolean): void {
    this.controller.setBoosting(value);
    const visual = this.controller.snapshot();
    const visualAnimation = visual.boosting && visual.animation === 'running' ? 'flying' : visual.animation;
    this.applyAnimation(visualAnimation);
    this.applyVisualState(visual);
  }

  public updateMotionAnimation(input: PlayerMotionVisualInput): void {
    const animation = this.controller.updateMotion(input);
    this.applyAnimation(animation);
    const visual = this.controller.snapshot();
    this.applyVisualState(visual);
  }

  public getVisualState(): PlayerVisualState { return this.controller.snapshot(); }

  public getVisualDebugSnapshot(): PlayerVisualDebugSnapshot {
    const bounds = this.getCollisionBounds();
    const booster = this.jetpack.getVisualSnapshot();
    return {
      collisionBounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
      animation: this.controller.snapshot().animation,
      spriteFrame: Number(this.sprite.frame.name),
      renderRootCount: this.scene.children.getAll().filter((child) => child === this).length,
      playerChildCount: this.list.length,
      jetpackAttachmentCount: 1,
      hasDebugBounds: Boolean(this.debugBounds),
      hasPersistentTrail: false,
      flameVisible: booster.flameVisible,
      boosterStyleId: booster.styleId,
      boosterMode: booster.mode,
      jetpackActivity: booster.activity,
      rocketFormVisible: booster.rocketFormVisible,
      rocketFormParent: booster.rocketFormParent,
      flameParent: booster.flameParent,
      sparkEmitterCount: booster.sparkEmitterCount,
      hasDetachedBoosterRoot: booster.hasDetachedBoosterRoot,
      bodyTextureKey: this.sprite.texture.key,
    };
  }

  public toggleDebugOverlay(): boolean {
    if (this.debugBounds) {
      this.debugBounds.destroy();
      this.debugBounds = undefined;
      return false;
    }
    this.debugBounds = this.scene.add.graphics().setDepth(30);
    this.drawDebugOverlay();
    return true;
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
    this.applyAnimation('hit');
    this.jetpack.setBoosting(false);
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
    this.setAnimation('dead');
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

  private applyVisualState(visual: PlayerVisualState): void {
    const activity: JetpackActivity = visual.gray || visual.animation === 'dead' || visual.animation === 'hit'
      ? 'off'
      : visual.boosting
        ? 'boosting'
        : visual.animation === 'takeoff'
          ? 'takeoff'
          : visual.animation === 'flying'
            ? 'flying'
            : 'off';
    this.jetpack.setActivity(activity);
    this.jetpack.setGray(visual.gray);
    this.applyGray(visual.gray);
    if (!visual.gray && visual.boosting) {
      this.setAngle(GAME_CONFIG.playerLeanDegrees);
    } else if (!visual.gray && visual.animation !== 'hit' && visual.animation !== 'dead') {
      this.setAngle(0);
    }
    this.drawDebugOverlay();
  }

  private drawDebugOverlay(): void {
    if (!this.debugBounds) return;
    this.debugBounds.clear();
    this.debugBounds.lineStyle(2, 0x38a8ff, 0.95);
    this.debugBounds.strokeRect(
      this.x - PLAYER_SPRITE_DISPLAY_SIZE.width / 2,
      this.y - PLAYER_SPRITE_DISPLAY_SIZE.height / 2,
      PLAYER_SPRITE_DISPLAY_SIZE.width,
      PLAYER_SPRITE_DISPLAY_SIZE.height,
    );
    const bounds = this.getCollisionBounds();
    this.debugBounds.lineStyle(2, 0xff3d55, 0.95);
    this.debugBounds.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  }
}

