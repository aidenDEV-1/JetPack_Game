import Phaser from 'phaser';
import { PlayerAnimationController } from './playerAnimations';
import type { PlayerAnimation, PlayerConfig, PlayerVisualState } from './playerTypes';

export class PlayerEntity extends Phaser.GameObjects.Container {
  private readonly controller = new PlayerAnimationController();
  private readonly bodyShape: Phaser.GameObjects.Ellipse;
  private readonly face: Phaser.GameObjects.Ellipse;
  private readonly hat: Phaser.GameObjects.Arc;
  private readonly glasses: Phaser.GameObjects.Graphics;
  private readonly bag: Phaser.GameObjects.Rectangle;
  private readonly flame: Phaser.GameObjects.Triangle;
  private readonly boostAura: Phaser.GameObjects.Arc;
  private crashStarted = false;

  public constructor(scene: Phaser.Scene, config: PlayerConfig) {
    super(scene, config.x, config.floorY - 74);
    scene.add.existing(this);
    this.setScale(config.scale);

    this.bodyShape = scene.add.ellipse(0, 22, 58, 80, 0xf1bf91);
    this.face = scene.add.ellipse(0, -8, 52, 58, 0xf3c49b);
    this.hat = scene.add.arc(0, -42, 38, 180, 360, false, 0xd8a84d).setStrokeStyle(6, 0x9c6b2b);
    this.glasses = scene.add.graphics();
    this.glasses.lineStyle(3, 0x3b2116, 1);
    this.glasses.strokeCircle(-13, -9, 10);
    this.glasses.strokeCircle(13, -9, 10);
    this.glasses.lineBetween(-3, -9, 3, -9);
    this.bag = scene.add.rectangle(-39, 17, 26, 48, 0x7a421f).setStrokeStyle(4, 0x3b2116);
    this.flame = scene.add.triangle(-39, 52, 0, 30, 14, 0, 28, 30, 0xff8a24);
    this.boostAura = scene.add.arc(-8, 8, 63, 0, 360, false, 0x52c7ff, 0.18).setStrokeStyle(4, 0x52c7ff, 0.8);
    this.add([this.boostAura, this.bag, this.flame, this.bodyShape, this.face, this.hat, this.glasses]);
    this.boostAura.setVisible(false);
    this.setAnimation('running');
  }

  public setAnimation(state: PlayerAnimation): void {
    this.controller.setAnimation(state);
    const visual = this.controller.snapshot();
    this.flame.setVisible(state !== 'running' && state !== 'fallen');
    this.bodyShape.setAngle(state === 'running' ? 0 : -8);
    this.boostAura.setVisible(visual.boosting);
    this.applyGray(visual.gray);
  }

  public setBoosting(value: boolean): void {
    this.controller.setBoosting(value);
    const visual = this.controller.snapshot();
    this.boostAura.setVisible(visual.boosting);
    this.flame.setScale(visual.boosting ? 1.5 : 1);
  }

  public getVisualState(): PlayerVisualState { return this.controller.snapshot(); }

  public async crash(): Promise<void> {
    if (this.crashStarted || !this.controller.beginCrash()) return;
    this.crashStarted = true;
    this.setAnimation('crashing');
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

  private applyGray(gray: boolean): void {
    const color = gray ? 0x8a929c : 0xf1bf91;
    this.bodyShape.setFillStyle(color);
    this.face.setFillStyle(gray ? 0x9aa1aa : 0xf3c49b);
    this.hat.setFillStyle(gray ? 0x7e858d : 0xd8a84d);
    this.bag.setFillStyle(gray ? 0x565b62 : 0x7a421f);
  }
}
