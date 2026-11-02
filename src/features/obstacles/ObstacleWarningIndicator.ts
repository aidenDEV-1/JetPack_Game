import Phaser from 'phaser';
import { GAME_CONFIG } from '../../game/config/gameConfig';

export interface ObstacleWarningSnapshot {
  visible: boolean;
  x: number;
  y: number;
  alpha: number;
  label: '← 위험';
}

export class ObstacleWarningIndicator extends Phaser.GameObjects.Container {
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly icon: Phaser.GameObjects.Text;
  private readonly label: Phaser.GameObjects.Text;

  public constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.panel = scene.add.rectangle(0, 0, 112, 54, 0x9f2431, 0.92)
      .setStrokeStyle(3, 0xffff6b, 0.95);
    this.icon = scene.add.text(-42, 0, '⚠', {
      color: '#ffff6b',
      fontFamily: 'Arial, sans-serif',
      fontSize: '25px',
      fontStyle: 'bold',
      stroke: '#2b0710',
      strokeThickness: 5,
    }).setOrigin(0.5);
    this.label = scene.add.text(15, 0, '← 위험', {
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '19px',
      fontStyle: 'bold',
      stroke: '#2b0710',
      strokeThickness: 5,
    }).setOrigin(0.5);
    this.add([this.panel, this.icon, this.label]);
    this.setDepth(10);
    this.hide();
  }

  public show(viewportWidth: number, obstacleY: number): void {
    if (!this.visible) {
      this.setVisible(true);
      this.setAlpha(1);
      this.setScale(1);
    }
    this.setPosition(viewportWidth - 56, this.clampY(obstacleY));
  }

  public setColor(color: number): void {
    this.panel.setFillStyle(color, 0.92);
  }

  public hide(): void {
    this.setVisible(false);
    this.setAlpha(0);
    this.setScale(1);
  }

  public update(timeMs: number, viewportWidth: number, obstacleY: number): void {
    if (!this.visible) return;
    const pulse = Math.abs(Math.sin(timeMs * 0.012));
    this.setPosition(viewportWidth - 56, this.clampY(obstacleY));
    this.setAlpha(0.55 + pulse * 0.45);
    this.setScale(1 + pulse * 0.06);
  }

  public snapshot(): ObstacleWarningSnapshot {
    return {
      visible: this.visible,
      x: this.x,
      y: this.y,
      alpha: this.alpha,
      label: '← 위험',
    };
  }

  private clampY(value: number): number {
    return Phaser.Math.Clamp(value, GAME_CONFIG.ceilingY + 48, GAME_CONFIG.floorY - 48);
  }
}
