import Phaser from 'phaser';
import { gameAssetKeys } from '../../content/assets/gameAssets';
import type { ObstaclePattern, ResolvedLaserGeometry } from './obstacleTypes';
import { LaserHazardVisual } from './LaserHazardVisual';
import { ObstacleWarningIndicator, type ObstacleWarningSnapshot } from './ObstacleWarningIndicator';
import { obstacleVisualCatalog } from './obstacleVisualCatalog';
import { MissileEntity } from './MissileEntity';

export class ObstacleEntity extends Phaser.GameObjects.Container {
  public readonly pattern: ObstaclePattern;
  private readonly hazard: Phaser.GameObjects.GameObject;
  private readonly warningIndicator?: ObstacleWarningIndicator;
  private readonly hitboxes: Phaser.Geom.Rectangle[];
  private readonly nodeCircles: Phaser.Geom.Circle[];
  private readonly laserGeometry?: ResolvedLaserGeometry;
  private readonly laserVisuals: LaserHazardVisual[] = [];
  private readonly missile?: MissileEntity;
  private spriteVisual?: Phaser.GameObjects.Container;
  private spriteCore?: Phaser.GameObjects.Graphics;
  private motionElapsedMs = 0;
  private warningCuePending = false;
  private missileLaunchCuePending = false;

  public constructor(scene: Phaser.Scene, pattern: ObstaclePattern, x: number, y: number, laserGeometry?: ResolvedLaserGeometry) {
    super(scene, x, y);
    this.pattern = pattern;
    this.laserGeometry = laserGeometry;
    if (pattern.kind === 'missile') this.missile = new MissileEntity();
    scene.add.existing(this);
    this.hazard = this.createHazard(scene, pattern);
    this.add(this.hazard);
    this.hitboxes = this.createHitboxes(pattern);
    this.nodeCircles = this.createNodeCircles(pattern);
    if (pattern.warningArrow) {
      this.warningIndicator = new ObstacleWarningIndicator(scene);
      this.warningIndicator.setColor(pattern.warningColor);
    }
  }

  public getCollisionBounds(): Phaser.Geom.Rectangle { return this.hitboxes[0]; }
  public getCollisionBoundsList(): readonly Phaser.Geom.Rectangle[] { return this.hitboxes; }
  public getCollisionCircles(): readonly Phaser.Geom.Circle[] { return this.nodeCircles; }
  public hasWarningArrow(): boolean { return this.warningIndicator !== undefined; }
  public isOffscreen(): boolean { return this.x < -160; }
  public isMissileEvaded(): boolean { return Boolean(this.missile && this.missile.getPhase() !== 'warning' && this.isOffscreen()); }

  public updateWarning(timeMs: number, viewportWidth: number): void {
    this.updateVisual(timeMs, viewportWidth);
  }

  public updateHazardBehavior(deltaMs: number, viewportWidth: number, playerY: number, worldSpeed: number): void {
    if (!this.missile) return;
    const previousPhase = this.missile.getPhase();
    const movement = this.missile.update(deltaMs, this.x, this.y, playerY, viewportWidth, worldSpeed);
    this.x += movement.extraX;
    this.y = movement.nextY;
    if (previousPhase === 'warning' && this.missile.getPhase() === 'launched') this.missileLaunchCuePending = true;
  }

  public consumeWarningCue(): boolean {
    const pending = this.warningCuePending;
    this.warningCuePending = false;
    return pending;
  }

  public consumeMissileLaunchCue(): boolean {
    const pending = this.missileLaunchCuePending;
    this.missileLaunchCuePending = false;
    return pending;
  }

  public updateVisual(timeMs: number, viewportWidth: number): void {
    this.laserVisuals.forEach((laser) => laser.update(timeMs));
    this.updateSpriteMotion(timeMs);
    if (!this.warningIndicator) return;
    if (this.x <= viewportWidth - 220) {
      this.warningIndicator.hide();
      return;
    }
    if (!this.warningIndicator.visible) this.warningCuePending = true;
    this.warningIndicator.show(viewportWidth, this.y);
    this.warningIndicator.update(timeMs, viewportWidth, this.y);
  }

  public hideWarning(): void { this.warningIndicator?.hide(); }

  public getVisualDebugSnapshot(): {
    kind: string;
    visualId: string;
    motion: string;
    x: number;
    orientation?: 'vertical' | 'horizontal';
    spanMode?: 'full' | 'fixed' | 'random';
    resolvedLength?: number;
    collisionLength?: number;
    activity?: 'charging' | 'active';
    beamWidth?: number;
    coreWidth?: number;
    glowWidth?: number;
    emitterCount?: number;
    displayWidth: number;
    displayHeight: number;
    collisionBounds: Array<{ x: number; y: number; width: number; height: number }>;
    collisionCircles: Array<{ x: number; y: number; radius: number }>;
    warning: ObstacleWarningSnapshot;
    missilePhase?: string;
  } {
    const dimensions = this.getDisplayDimensions();
    return {
      kind: this.pattern.kind,
      visualId: this.pattern.visualId,
      motion: this.pattern.motion.type,
      x: this.x,
      orientation: this.laserGeometry?.orientation,
      spanMode: this.pattern.laserSpan?.mode,
      resolvedLength: this.laserGeometry?.length,
      collisionLength: this.laserGeometry?.collisionLength,
      activity: this.laserVisuals[0]?.getActivity(),
      beamWidth: this.pattern.laserVisual?.beamWidth,
      coreWidth: this.pattern.laserVisual?.coreWidth,
      glowWidth: this.pattern.laserVisual?.glowWidth,
      emitterCount: this.laserVisuals.reduce((count, laser) => count + laser.getEmitterCount(), 0),
      displayWidth: dimensions.width,
      displayHeight: dimensions.height,
      collisionBounds: this.hitboxes.map((bounds) => ({ x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height })),
      collisionCircles: this.nodeCircles.map((circle) => ({ x: circle.x, y: circle.y, radius: circle.radius })),
      warning: this.warningIndicator?.snapshot() ?? { visible: false, x: 0, y: 0, alpha: 0, label: '← 위험' },
      missilePhase: this.missile?.getPhase(),
    };
  }

  public override destroy(fromScene?: boolean): void {
    this.warningIndicator?.destroy(fromScene);
    super.destroy(fromScene);
  }

  private createHazard(scene: Phaser.Scene, pattern: ObstaclePattern): Phaser.GameObjects.GameObject {
    if (this.laserGeometry && pattern.laserVisual) {
      const laser = new LaserHazardVisual(scene, {
        geometry: this.laserGeometry,
        visual: pattern.laserVisual,
        emitterTextureKey: gameAssetKeys.laserEmitter,
      });
      this.laserVisuals.push(laser);
      return laser;
    }
    return this.createSpriteHazard(scene, pattern);
  }

  private createSpriteHazard(scene: Phaser.Scene, pattern: ObstaclePattern): Phaser.GameObjects.Container {
    const container = new Phaser.GameObjects.Container(scene, 0, 0);
    const glow = new Phaser.GameObjects.Graphics(scene);
    glow.fillStyle(obstacleVisualCatalog[pattern.visualId].outlineColor, 0.14);
    glow.fillCircle(0, 0, 18);
    container.add(glow);
    this.spriteCore = new Phaser.GameObjects.Graphics(scene);
    this.spriteCore.fillStyle(obstacleVisualCatalog[pattern.visualId].coreColor, 0.9);
    this.spriteCore.fillCircle(0, 0, 7);
    container.add(this.spriteCore);
    const sprite = scene.make.sprite({
      key: gameAssetKeys.obstaclesSheet,
      frame: obstacleVisualCatalog[pattern.visualId].frame,
      add: false,
    })
      .setDisplaySize(pattern.displayWidth, pattern.displayHeight)
      .setTint(pattern.accentColor);
    container.add(sprite);
    this.spriteVisual = container;
    return container;
  }

  private updateSpriteMotion(timeMs: number): void {
    if (!this.spriteVisual) return;
    this.motionElapsedMs = Math.max(this.motionElapsedMs, timeMs);
    const motion = this.pattern.motion;
    const phase = (this.motionElapsedMs / Math.max(1, motion.periodMs)) * Math.PI * 2;
    const wave = Math.sin(phase) * motion.amplitudePx;
    this.spriteVisual.setY(motion.type === 'hover' || motion.type === 'sway' || motion.type === 'spin' ? wave : 0);
    this.spriteVisual.setAngle(motion.type === 'spin' ? (this.motionElapsedMs / 1000) * motion.rotationDegPerSecond : wave * 0.35);
    this.spriteCore?.setAlpha(0.55 + (Math.sin(this.motionElapsedMs * 0.018) + 1) * 0.18);
  }

  private createHitboxes(pattern: ObstaclePattern): Phaser.Geom.Rectangle[] {
    if (this.laserGeometry && pattern.laserVisual) {
      const beamWidth = pattern.laserVisual.beamWidth;
      if (this.laserGeometry.orientation === 'vertical') {
        return [new Phaser.Geom.Rectangle(-beamWidth / 2, this.laserGeometry.start, beamWidth, this.laserGeometry.collisionLength)];
      }
      return [new Phaser.Geom.Rectangle(this.laserGeometry.start, -beamWidth / 2, this.laserGeometry.collisionLength, beamWidth)];
    }
    const insetX = pattern.width * 0.12;
    const insetY = pattern.height * 0.12;
    return [new Phaser.Geom.Rectangle(-pattern.width / 2 + insetX, -pattern.height / 2 + insetY, pattern.width - insetX * 2, pattern.height - insetY * 2)];
  }

  private createNodeCircles(pattern: ObstaclePattern): Phaser.Geom.Circle[] {
    if (!this.laserGeometry || !pattern.laserVisual) return [];
    const radius = pattern.laserVisual.emitterWidth / 2;
    return this.laserGeometry.orientation === 'vertical'
      ? [new Phaser.Geom.Circle(0, this.laserGeometry.start, radius), new Phaser.Geom.Circle(0, this.laserGeometry.end, radius)]
      : [new Phaser.Geom.Circle(this.laserGeometry.start, 0, radius), new Phaser.Geom.Circle(this.laserGeometry.end, 0, radius)];
  }

  private getDisplayDimensions(): { width: number; height: number } {
    if (!this.laserGeometry || !this.pattern.laserVisual) return { width: this.pattern.displayWidth, height: this.pattern.displayHeight };
    const span = this.laserGeometry.length + (this.laserGeometry.orientation === 'vertical' ? this.pattern.laserVisual.emitterHeight : this.pattern.laserVisual.emitterWidth);
    const thickness = Math.max(this.pattern.laserVisual.glowWidth, this.pattern.laserVisual.emitterWidth, this.pattern.laserVisual.emitterHeight);
    return this.laserGeometry.orientation === 'vertical'
      ? { width: thickness, height: span }
      : { width: span, height: thickness };
  }
}
