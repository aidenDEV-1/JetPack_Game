import Phaser from 'phaser';
import type { ObstaclePattern } from './obstacleTypes';

export class ObstacleEntity extends Phaser.GameObjects.Container {
  public readonly pattern: ObstaclePattern;
  private readonly hazard: Phaser.GameObjects.GameObject;
  private readonly warningArrow?: Phaser.GameObjects.Text;

  public constructor(scene: Phaser.Scene, pattern: ObstaclePattern, x: number, y: number) {
    super(scene, x, y);
    this.pattern = pattern;
    scene.add.existing(this);
    this.hazard = this.createHazard(scene, pattern);
    this.add(this.hazard);
    if (pattern.warningArrow) {
      this.warningArrow = scene.add.text(0, -70, '← 위험', { color: '#f7c948', fontSize: '18px', fontStyle: 'bold' }).setOrigin(0.5);
      this.add(this.warningArrow);
    }
  }

  public getCollisionBounds(): Phaser.Geom.Rectangle { return this.getBounds(); }
  public hasWarningArrow(): boolean { return this.warningArrow !== undefined; }

  private createHazard(scene: Phaser.Scene, pattern: ObstaclePattern): Phaser.GameObjects.GameObject {
    switch (pattern.kind) {
      case 'vertical-laser':
        return scene.add.rectangle(0, 0, pattern.width, pattern.height, pattern.requiresShield ? 0xffcc33 : 0xff365b).setStrokeStyle(5, 0xfff4b3);
      case 'horizontal-laser':
        return scene.add.rectangle(0, 0, pattern.width, pattern.height, 0xff365b).setStrokeStyle(5, 0xfff4b3);
      case 'missile':
        return scene.add.triangle(0, 0, -40, -15, 40, 0, -40, 15, 0xe84a3a).setStrokeStyle(3, 0xffffff);
      case 'monster':
        return scene.add.circle(0, 0, pattern.width / 2, 0x7a4eaa).setStrokeStyle(4, 0xf3c49b);
    }
  }
}
