import Phaser from 'phaser';
import { gameAssetKeys } from '../../content/assets/gameAssets';
import type { ObstaclePattern, ResolvedLaserGeometry } from './obstacleTypes';
import { LaserHazardVisual } from './LaserHazardVisual';
import { ObstacleWarningIndicator, type ObstacleWarningSnapshot } from './ObstacleWarningIndicator';

const OBSTACLE_FRAMES = { missile: 4, monster: 5 } as const;

export class ObstacleEntity extends Phaser.GameObjects.Container {
  public readonly pattern: ObstaclePattern;
  private readonly hazard: Phaser.GameObjects.GameObject;
  private readonly warningIndicator?: ObstacleWarningIndicator;
  private readonly hitboxes: Phaser.Geom.Rectangle[];
  private readonly laserGeometry?: ResolvedLaserGeometry;
  private readonly laserVisuals: LaserHazardVisual[] = [];

  public constructor(scene: Phaser.Scene, pattern: ObstaclePattern, x: number, y: number, laserGeometry?: ResolvedLaserGeometry) {
    super(scene, x, y);
    this.pattern = pattern;
    this.laserGeometry = laserGeometry;
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
    this.updateVisual(timeMs, viewportWidth);
  }

  public updateVisual(timeMs: number, viewportWidth: number): void {
    if (!this.warningIndicator) return;
    this.laserVisuals.forEach((laser) => laser.update(timeMs));
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
    warning: ObstacleWarningSnapshot;
  } {
    const dimensions = this.getDisplayDimensions();
    return {
      kind: this.pattern.kind,
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
      warning: this.warningIndicator?.snapshot() ?? { visible: false, x: 0, y: 0, alpha: 0, label: '← 위험' },
    };
  }

  public override destroy(fromScene?: boolean): void {
    this.warningIndicator?.destroy(fromScene);
    super.destroy(fromScene);
  }

  private createHazard(scene: Phaser.Scene, pattern: ObstaclePattern): Phaser.GameObjects.GameObject {
    if (this.laserGeometry && pattern.laserVisual) {
      if (pattern.id === 'forced-crossfire') {
        const crossfire = new Phaser.GameObjects.Container(scene, 0, 0);
        [-pattern.height * 0.28, pattern.height * 0.28].forEach((offsetY) => {
          const laser = new LaserHazardVisual(scene, {
            geometry: this.laserGeometry!,
            visual: pattern.laserVisual!,
            emitterTextureKey: gameAssetKeys.laserEmitter,
          });
          this.laserVisuals.push(laser);
          laser.setPosition(0, offsetY);
          crossfire.add(laser);
        });
        return crossfire;
      }
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
    glow.fillStyle(pattern.warningColor, 0.18);
    if (pattern.kind === 'monster') glow.fillCircle(0, 0, pattern.displayWidth * 0.58);
    else glow.fillRoundedRect(-pattern.displayWidth / 2 - 10, -pattern.displayHeight / 2 - 10, pattern.displayWidth + 20, pattern.displayHeight + 20, 16);
    container.add(glow);
    const sprite = scene.make.sprite({
      key: gameAssetKeys.obstaclesSheet,
      frame: pattern.kind === 'missile' ? OBSTACLE_FRAMES.missile : OBSTACLE_FRAMES.monster,
      add: false,
    })
      .setDisplaySize(pattern.displayWidth, pattern.displayHeight)
      .setTint(pattern.accentColor);
    container.add(sprite);
    return container;
  }

  private createHitboxes(pattern: ObstaclePattern): Phaser.Geom.Rectangle[] {
    if (this.laserGeometry && pattern.laserVisual) {
      const beamWidth = pattern.laserVisual.beamWidth;
      if (pattern.id === 'forced-crossfire') {
        const offsetY = pattern.height * 0.28;
        return [
          new Phaser.Geom.Rectangle(this.laserGeometry.start, -offsetY - beamWidth / 2, this.laserGeometry.collisionLength, beamWidth),
          new Phaser.Geom.Rectangle(this.laserGeometry.start, offsetY - beamWidth / 2, this.laserGeometry.collisionLength, beamWidth),
        ];
      }
      if (this.laserGeometry.orientation === 'vertical') {
        return [new Phaser.Geom.Rectangle(-beamWidth / 2, this.laserGeometry.start, beamWidth, this.laserGeometry.collisionLength)];
      }
      return [new Phaser.Geom.Rectangle(this.laserGeometry.start, -beamWidth / 2, this.laserGeometry.collisionLength, beamWidth)];
    }
    const insetX = pattern.width * 0.12;
    const insetY = pattern.height * 0.12;
    return [new Phaser.Geom.Rectangle(-pattern.width / 2 + insetX, -pattern.height / 2 + insetY, pattern.width - insetX * 2, pattern.height - insetY * 2)];
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
