import Phaser from 'phaser';
import { gameAssetKeys } from '../../content/assets/gameAssets';
import type { ObstaclePattern } from './obstacleTypes';
import { ObstacleWarningIndicator, type ObstacleWarningSnapshot } from './ObstacleWarningIndicator';

const OBSTACLE_FRAMES = { laser: 3, missile: 4, monster: 5 } as const;

export class ObstacleEntity extends Phaser.GameObjects.Container {
  public readonly pattern: ObstaclePattern;
  private readonly hazard: Phaser.GameObjects.GameObject;
  private readonly warningIndicator?: ObstacleWarningIndicator;
  private readonly hitboxes: Phaser.Geom.Rectangle[];

  public constructor(scene: Phaser.Scene, pattern: ObstaclePattern, x: number, y: number) {
    super(scene, x, y);
    this.pattern = pattern;
    scene.add.existing(this);
    this.hazard = this.createHazard(scene, pattern);
    this.add(this.hazard);
    this.hitboxes = this.createHitboxes(pattern);
    if (pattern.warningArrow) {
      this.warningIndicator = new ObstacleWarningIndicator(scene);
      this.warningIndicator.setColor(pattern.warningColor);
    }
  }

  public getCollisionBounds(): Phaser.Geom.Rectangle { return this.hitboxes[0]; }
  public getCollisionBoundsList(): readonly Phaser.Geom.Rectangle[] { return this.hitboxes; }
  public hasWarningArrow(): boolean { return this.warningIndicator !== undefined; }
  public isOffscreen(): boolean { return this.x < -160; }

  public updateWarning(timeMs: number, viewportWidth: number): void {
    if (!this.warningIndicator) return;
    if (this.x <= viewportWidth - 220) {
      this.warningIndicator.hide();
      return;
    }
    this.warningIndicator.show(viewportWidth, this.y);
    this.warningIndicator.update(timeMs, viewportWidth, this.y);
  }

  public hideWarning(): void { this.warningIndicator?.hide(); }

  public getVisualDebugSnapshot(): {
    kind: string;
    x: number;
    displayWidth: number;
    displayHeight: number;
    warning: ObstacleWarningSnapshot;
  } {
    return {
      kind: this.pattern.kind,
      x: this.x,
      displayWidth: this.pattern.displayWidth,
      displayHeight: this.pattern.displayHeight,
      warning: this.warningIndicator?.snapshot() ?? { visible: false, x: 0, y: 0, alpha: 0, label: '← 위험' },
    };
  }

  public override destroy(fromScene?: boolean): void {
    this.warningIndicator?.destroy(fromScene);
    super.destroy(fromScene);
  }

  private createHazard(scene: Phaser.Scene, pattern: ObstaclePattern): Phaser.GameObjects.GameObject {
    if (pattern.id === 'forced-crossfire') {
      const crossfire = scene.add.container(0, 0);
      [-pattern.height * 0.28, pattern.height * 0.28].forEach((offsetY) => {
        const laser = scene.add.sprite(0, offsetY, gameAssetKeys.obstaclesSheet, OBSTACLE_FRAMES.laser)
          .setDisplaySize(pattern.displayWidth, 30)
          .setTint(pattern.accentColor)
          .setAngle(90)
          .setAlpha(0.95);
        crossfire.add(laser);
      });
      return crossfire;
    }
    switch (pattern.kind) {
      case 'vertical-laser':
        return scene.add.sprite(0, 0, gameAssetKeys.obstaclesSheet, OBSTACLE_FRAMES.laser)
          .setDisplaySize(pattern.displayWidth, pattern.displayHeight)
          .setTint(pattern.accentColor);
      case 'horizontal-laser':
        return scene.add.sprite(0, 0, gameAssetKeys.obstaclesSheet, OBSTACLE_FRAMES.laser)
          .setDisplaySize(pattern.displayWidth, pattern.displayHeight)
          .setTint(pattern.accentColor)
          .setAngle(90);
      case 'missile':
        return scene.add.sprite(0, 0, gameAssetKeys.obstaclesSheet, OBSTACLE_FRAMES.missile)
          .setDisplaySize(pattern.displayWidth, pattern.displayHeight)
          .setTint(pattern.accentColor);
      case 'monster':
        return scene.add.sprite(0, 0, gameAssetKeys.obstaclesSheet, OBSTACLE_FRAMES.monster)
          .setDisplaySize(pattern.displayWidth, pattern.displayHeight)
          .setTint(pattern.accentColor);
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

