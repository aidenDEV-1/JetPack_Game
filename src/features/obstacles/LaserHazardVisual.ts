import Phaser from 'phaser';
import type { LaserVisualSpec, ResolvedLaserGeometry } from './obstacleTypes';

export interface LaserHazardVisualConfig {
  geometry: ResolvedLaserGeometry;
  visual: LaserVisualSpec;
  emitterTextureKey: string;
}

export class LaserHazardVisual extends Phaser.GameObjects.Container {
  private readonly displayBounds: Phaser.Geom.Rectangle;

  public constructor(scene: Phaser.Scene, config: LaserHazardVisualConfig) {
    super(scene, 0, 0);
    const { geometry, visual } = config;
    const graphics = new Phaser.GameObjects.Graphics(scene);
    this.drawBeam(graphics, geometry, visual.glowWidth, visual.glowColor, 0.34);
    this.drawBeam(graphics, geometry, visual.beamWidth, visual.beamColor, 0.92);
    this.drawBeam(graphics, geometry, visual.coreWidth, visual.coreColor, 1);
    this.add(graphics);

    const emitterStart = scene.make.image({ key: config.emitterTextureKey, add: false })
      .setDisplaySize(visual.emitterWidth, visual.emitterHeight)
      .setTint(visual.emitterColor);
    const emitterEnd = scene.make.image({ key: config.emitterTextureKey, add: false })
      .setDisplaySize(visual.emitterWidth, visual.emitterHeight)
      .setTint(visual.emitterColor);
    if (geometry.orientation === 'vertical') {
      emitterStart.setPosition(0, geometry.start);
      emitterEnd.setPosition(0, geometry.end);
      this.displayBounds = new Phaser.Geom.Rectangle(
        -Math.max(visual.glowWidth, visual.emitterWidth) / 2,
        geometry.start - visual.emitterHeight / 2,
        Math.max(visual.glowWidth, visual.emitterWidth),
        geometry.length + visual.emitterHeight,
      );
    } else {
      emitterStart.setPosition(geometry.start, 0);
      emitterEnd.setPosition(geometry.end, 0);
      this.displayBounds = new Phaser.Geom.Rectangle(
        geometry.start - visual.emitterWidth / 2,
        -Math.max(visual.glowWidth, visual.emitterHeight) / 2,
        geometry.length + visual.emitterWidth,
        Math.max(visual.glowWidth, visual.emitterHeight),
      );
    }
    this.add([emitterStart, emitterEnd]);
    this.setDepth(3);
  }

  public getDisplayBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.displayBounds.x, this.displayBounds.y, this.displayBounds.width, this.displayBounds.height);
  }

  private drawBeam(
    graphics: Phaser.GameObjects.Graphics,
    geometry: ResolvedLaserGeometry,
    width: number,
    color: number,
    alpha: number,
  ): void {
    graphics.fillStyle(color, alpha);
    if (geometry.orientation === 'vertical') {
      graphics.fillRect(-width / 2, geometry.start, width, geometry.length);
    } else {
      graphics.fillRect(geometry.start, -width / 2, geometry.length, width);
    }
  }
}
