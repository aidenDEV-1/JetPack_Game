import Phaser from 'phaser';

export interface JetpackAnchor {
  x: number;
  y: number;
}

export interface JetpackAttachmentConfig {
  textureKey: string;
  flameFrame: number;
  anchor: JetpackAnchor;
  scaleX: number;
  scaleY: number;
}

export class JetpackAttachment extends Phaser.GameObjects.Container {
  private readonly flame: Phaser.GameObjects.Sprite;
  private readonly anchor: JetpackAnchor;
  private readonly flameScale: { x: number; y: number };

  public constructor(scene: Phaser.Scene, config: JetpackAttachmentConfig) {
    super(scene, config.anchor.x, config.anchor.y);
    scene.add.existing(this);
    this.anchor = { ...config.anchor };
    this.flameScale = { x: config.scaleX, y: config.scaleY };
    this.flame = scene.add.sprite(0, 0, config.textureKey, config.flameFrame)
      .setScale(config.scaleX, config.scaleY);
    this.add(this.flame);
    this.setActive(false);
  }

  public override setActive(active: boolean): this {
    super.setActive(active);
    this.setVisible(active);
    return this;
  }

  public setGray(gray: boolean): void {
    this.flame.setTint(gray ? 0x707780 : 0xffffff);
  }

  public reset(): void {
    this.setPosition(this.anchor.x, this.anchor.y);
    this.setScale(1);
    this.setAlpha(1);
    this.flame.setScale(this.flameScale.x, this.flameScale.y);
    this.setGray(false);
    this.setActive(false);
  }
}
