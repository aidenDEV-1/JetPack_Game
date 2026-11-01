import Phaser from 'phaser';
import { gameAssetKeys } from '../../content/assets/gameAssets';
import type { ObstaclePattern } from './obstacleTypes';

const OBSTACLE_FRAMES = { laser: 3, missile: 4, monster: 5 } as const;

export class ObstacleEntity extends Phaser.GameObjects.Container {
  public readonly pattern: ObstaclePattern;
  private readonly hazard: Phaser.GameObjects.GameObject;
  private readonly warningArrow?: Phaser.GameObjects.Text;
  private readonly hitboxes: Phaser.Geom.Rectangle[];

  public constructor(scene: Phaser.Scene, pattern: ObstaclePattern, x: number, y: number) {
    super(scene, x, y);
    this.pattern = pattern;
    scene.add.existing(this);
    this.hazard = this.createHazard(scene, pattern);
    this.add(this.hazard);
    this.hitboxes = this.createHitboxes(pattern);
    if (pattern.warningArrow) {
      this.warningArrow = scene.add.text(0, -Math.max(70, pattern.height / 2 + 38), '← 위험', {
        color: '#f7c948',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        stroke: '#07111f',
        strokeThickness: 4,
      }).setOrigin(0.5);
      this.add(this.warningArrow);
    }
  }

  public getCollisionBounds(): Phaser.Geom.Rectangle { return this.hitboxes[0]; }
  public getCollisionBoundsList(): readonly Phaser.Geom.Rectangle[] { return this.hitboxes; }
  public hasWarningArrow(): boolean { return this.warningArrow !== undefined; }
  public isOffscreen(): boolean { return this.x < -160; }

  private createHazard(scene: Phaser.Scene, pattern: ObstaclePattern): Phaser.GameObjects.GameObject {
    if (pattern.id === 'forced-crossfire') {
      const crossfire = scene.add.container(0, 0);
      [-pattern.height * 0.28, pattern.height * 0.28].forEach((offsetY) => {
        const laser = scene.add.sprite(0, offsetY, gameAssetKeys.obstaclesSheet, OBSTACLE_FRAMES.laser)
          .setDisplaySize(pattern.width, 30)
          .setAngle(90)
          .setAlpha(0.95);
        crossfire.add(laser);
      });
      return crossfire;
    }
    switch (pattern.kind) {
      case 'vertical-laser':
        return scene.add.sprite(0, 0, gameAssetKeys.obstaclesSheet, OBSTACLE_FRAMES.laser).setDisplaySize(pattern.width, pattern.height);
      case 'horizontal-laser':
        return scene.add.sprite(0, 0, gameAssetKeys.obstaclesSheet, OBSTACLE_FRAMES.laser).setDisplaySize(pattern.width, pattern.height).setAngle(90);
      case 'missile':
        return scene.add.sprite(0, 0, gameAssetKeys.obstaclesSheet, OBSTACLE_FRAMES.missile).setDisplaySize(pattern.width, pattern.height);
      case 'monster':
        return scene.add.sprite(0, 0, gameAssetKeys.obstaclesSheet, OBSTACLE_FRAMES.monster).setDisplaySize(pattern.width, pattern.height);
    }
  }

  private createHitboxes(pattern: ObstaclePattern): Phaser.Geom.Rectangle[] {
    if (pattern.id === 'forced-crossfire') {
      const offsetY = pattern.height * 0.28;
      return [
        new Phaser.Geom.Rectangle(-pattern.width / 2, -offsetY - 15, pattern.width, 30),
        new Phaser.Geom.Rectangle(-pattern.width / 2, offsetY - 15, pattern.width, 30),
      ];
    }
    const insetX = pattern.width * 0.12;
    const insetY = pattern.height * 0.12;
    return [new Phaser.Geom.Rectangle(-pattern.width / 2 + insetX, -pattern.height / 2 + insetY, pattern.width - insetX * 2, pattern.height - insetY * 2)];
  }
}

