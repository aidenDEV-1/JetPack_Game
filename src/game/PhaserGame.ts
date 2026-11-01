import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { RunScene } from './scenes/RunScene';

export interface GameBridge {
  onReady: () => void;
  onAssetError?: (message: string) => void;
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
    scene: [new BootScene(bridge), RunScene],
    render: {
      antialias: true,
      pixelArt: false,
    },
  });
}
