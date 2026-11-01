import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';

export interface GameBridge {
  onReady: () => void;
}

export function createPhaserGame(parent: HTMLElement, bridge: GameBridge): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 1280,
    height: 720,
    backgroundColor: '#07111f',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [new BootScene(bridge)],
    render: {
      antialias: true,
      pixelArt: false,
    },
  });
}
