import Phaser from 'phaser';
import type { GameBridge } from '../PhaserGame';

export class BootScene extends Phaser.Scene {
  private readonly bridge: GameBridge;

  public constructor(bridge: GameBridge) {
    super('BootScene');
    this.bridge = bridge;
  }

  public create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a1728);
    this.add.text(width / 2, height / 2 - 20, '5PM RUSH', {
      color: '#f7c948',
      fontFamily: 'Arial, sans-serif',
      fontSize: '56px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 44, '5시 정각, 그들의 레이스가 시작된다', {
      color: '#d9e6f2',
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
    }).setOrigin(0.5);
    this.bridge.onReady();
    this.scene.start('RunScene');
  }
}
