import Phaser from 'phaser';
import type { LaserActivity, LaserVisualSpec, ResolvedLaserGeometry } from './obstacleTypes';

export interface LaserHazardVisualConfig {
  geometry: ResolvedLaserGeometry;
  visual: LaserVisualSpec;
  emitterTextureKey: string;
}

export class LaserHazardVisual extends Phaser.GameObjects.Container {
  private readonly displayBounds: Phaser.Geom.Rectangle;
  private readonly glow: Phaser.GameObjects.Graphics;
  private readonly beam: Phaser.GameObjects.Graphics;
  private readonly core: Phaser.GameObjects.Graphics;
  private readonly emitters: Phaser.GameObjects.Image[];
  private readonly sparks: Phaser.GameObjects.Graphics[];
  private readonly geometry: ResolvedLaserGeometry;
  private readonly visual: LaserVisualSpec;
  private activity: LaserActivity = 'charging';
  private startedAt?: number;

  public constructor(scene: Phaser.Scene, config: LaserHazardVisualConfig) {
    super(scene, 0, 0);
    const { geometry, visual } = config;
    this.geometry = config.geometry;
    this.visual = config.visual;
    this.glow = new Phaser.GameObjects.Graphics(scene);
    this.beam = new Phaser.GameObjects.Graphics(scene);
    this.core = new Phaser.GameObjects.Graphics(scene);
    this.drawBeam(this.glow, this.geometry, visual.glowWidth, visual.glowColor);
    this.drawBeam(this.beam, this.geometry, visual.beamWidth, visual.beamColor);
    this.drawBeam(this.core, this.geometry, visual.coreWidth, visual.coreColor);
    this.add([this.glow, this.beam, this.core]);

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
    this.emitters = [emitterStart, emitterEnd];
    this.add(this.emitters);
    this.sparks = this.createSparks(scene);
    this.add(this.sparks);
    this.setDepth(3);
    this.update(0);
  }

  public setActivity(activity: LaserActivity): void {
    this.activity = activity;
    if (activity === 'charging') this.startedAt = undefined;
    this.update(this.startedAt ?? 0);
  }

  public getActivity(): LaserActivity { return this.activity; }
  public getEmitterCount(): number { return this.emitters.length; }

  public update(timeMs: number): void {
    if (this.startedAt === undefined) this.startedAt = timeMs;
    if (this.activity === 'charging' && timeMs - this.startedAt >= this.visual.chargeDurationMs) this.activity = 'active';
    const pulse = (Math.sin(timeMs * 0.012) + 1) / 2;
    const active = this.activity === 'active';
    this.glow.setAlpha(active ? 0.2 + pulse * 0.12 : 0.08 + pulse * 0.08);
    this.beam.setAlpha(active ? 0.78 + pulse * 0.16 : 0.28 + pulse * 0.2);
    this.core.setAlpha(active ? 0.88 + pulse * 0.12 : 0.5 + pulse * 0.25);
    this.emitters.forEach((emitter, index) => {
      emitter.setAlpha(active ? 0.88 + pulse * 0.12 : 0.55 + pulse * 0.25);
      emitter.setScale(active ? 0.96 + pulse * 0.08 : 0.88 + pulse * 0.08);
      emitter.setRotation(index === 0 ? pulse * 0.03 : -pulse * 0.03);
    });
    this.sparks.forEach((spark, index) => {
      const sparkPulse = (Math.sin(timeMs * 0.02 + index * 1.7) + 1) / 2;
      spark.setVisible(active || index < 2);
      spark.setAlpha((active ? 0.35 : 0.12) + sparkPulse * (active ? 0.55 : 0.25));
      spark.setScale(0.75 + sparkPulse * 0.5);
      spark.setAngle((timeMs * (index % 2 === 0 ? 0.08 : -0.06)) + index * 31);
    });
  }

  public getDisplayBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.displayBounds.x, this.displayBounds.y, this.displayBounds.width, this.displayBounds.height);
  }

  private drawBeam(
    graphics: Phaser.GameObjects.Graphics,
    geometry: ResolvedLaserGeometry,
    width: number,
    color: number,
  ): void {
    graphics.fillStyle(color, 1);
    if (geometry.orientation === 'vertical') {
      graphics.fillRect(-width / 2, geometry.start, width, geometry.length);
    } else {
      graphics.fillRect(geometry.start, -width / 2, geometry.length, width);
    }
  }

  private createSparks(scene: Phaser.Scene): Phaser.GameObjects.Graphics[] {
    const points = this.geometry.orientation === 'vertical'
      ? [
        { x: -10, y: this.geometry.start + 8 },
        { x: 9, y: this.geometry.start + 17 },
        { x: -9, y: this.geometry.end - 14 },
        { x: 10, y: this.geometry.end - 5 },
      ]
      : [
        { x: this.geometry.start + 8, y: -10 },
        { x: this.geometry.start + 17, y: 9 },
        { x: this.geometry.end - 14, y: -9 },
        { x: this.geometry.end - 5, y: 10 },
      ];
    return points.map(({ x, y }) => {
      const spark = new Phaser.GameObjects.Graphics(scene);
      spark.lineStyle(2, this.visual.sparkColor, 1);
      spark.lineBetween(-5, 0, 5, 0);
      spark.lineBetween(0, -5, 0, 5);
      spark.fillStyle(this.visual.sparkColor, 1);
      spark.fillCircle(0, 0, 1.5);
      spark.setPosition(x, y);
      return spark;
    });
  }
}
