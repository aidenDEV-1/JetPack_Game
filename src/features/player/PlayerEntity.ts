import Phaser from 'phaser';
import { gameAssetKeys } from '../../content/assets/gameAssets';
import { PlayerAnimationController } from './playerAnimations';
import { PLAYER_ANIMATION_KEYS, PLAYER_COLLISION_BOUNDS, PLAYER_SPRITE_SCALE } from './playerAssetConfig';
import type { PlayerAnimation, PlayerConfig, PlayerVisualState } from './playerTypes';

export class PlayerEntity extends Phaser.GameObjects.Container {
  private readonly controller = new PlayerAnimationController();
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly flame: Phaser.GameObjects.Sprite;
  private readonly boostAura: Phaser.GameObjects.Sprite;
  private readonly boostTrail: Phaser.GameObjects.Sprite;
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

    this.boostTrail = scene.add.sprite(-110, 10, gameAssetKeys.boosterVfxSheet, 2)
      .setScale(0.32, 0.2)
      .setAlpha(0.9);
    this.boostAura = scene.add.sprite(0, 0, gameAssetKeys.boosterVfxSheet, 1)
      .setScale(0.2)
      .setAlpha(0.8);
    this.flame = scene.add.sprite(-78, 18, gameAssetKeys.boosterVfxSheet, 0)
      .setScale(0.18, 0.25);
    this.sprite = scene.add.sprite(0, 0, gameAssetKeys.playerSheet, 0).setScale(PLAYER_SPRITE_SCALE);
    this.add([this.boostTrail, this.boostAura, this.flame, this.sprite]);
    this.boostTrail.setVisible(false);
    this.boostAura.setVisible(false);
    this.flame.setVisible(false);
    this.setAnimation('running');
  }

  public setAnimation(state: PlayerAnimation): void {
    this.controller.setAnimation(state);
    const visual = this.controller.snapshot();
    this.applyAnimation(visual.animation);
    this.boostAura.setVisible(visual.boosting && !visual.gray);
    this.boostTrail.setVisible(visual.boosting && !visual.gray);
    this.flame.setVisible(visual.boosting && !visual.gray);
    this.applyGray(visual.gray);
  }

  public setBoosting(value: boolean): void {
    this.controller.setBoosting(value);
    const visual = this.controller.snapshot();
    this.applyAnimation(visual.animation);
    this.boostAura.setVisible(visual.boosting && !visual.gray);
    this.boostTrail.setVisible(visual.boosting && !visual.gray);
    this.flame.setVisible(visual.boosting && !visual.gray);
    this.boostAura.setAlpha(visual.boosting ? 0.9 : 0);
    this.flame.setScale(visual.boosting ? 0.24 : 0.18, visual.boosting ? 0.34 : 0.25);
    this.applyGray(visual.gray);
  }

  public getVisualState(): PlayerVisualState { return this.controller.snapshot(); }

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
    this.boostAura.setVisible(false);
    this.boostTrail.setVisible(false);
    this.flame.setVisible(false);
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
    this.setAnimation('running');
    this.setBoosting(false);
  }

  private applyAnimation(state: PlayerAnimation): void {
    if (this.currentAnimation === state) return;
    this.sprite.play(PLAYER_ANIMATION_KEYS[state], true);
    this.currentAnimation = state;
  }

  private applyGray(gray: boolean): void {
    const tint = gray ? 0x7e8791 : 0xffffff;
    this.sprite.setTint(tint);
    this.flame.setTint(gray ? 0x707780 : 0xffffff);
    this.boostAura.setTint(gray ? 0x707780 : 0xffffff);
    this.boostTrail.setTint(gray ? 0x707780 : 0xffffff);
  }
}

