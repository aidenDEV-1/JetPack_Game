import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { RunScene } from './scenes/RunScene';
import type { RunState } from './state/GameState';

export interface GameBridge {
  onReady: () => void;
  onStateChange: (snapshot: RunState) => void;
  onRunEnd: (snapshot: RunState) => void;
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
    scene: [new BootScene(bridge), new RunScene(bridge)],
    render: {
      antialias: true,
      pixelArt: false,
    },
  });
}
