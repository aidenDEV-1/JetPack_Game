import Phaser from 'phaser';
import type { GameBridge } from '../PhaserGame';
import { assetRegistry } from '../../services/assetRegistry';
import { gameAssetKeys } from '../../content/assets/gameAssets';
import { PLAYER_ANIMATION_RANGES } from '../../features/player/playerAssetConfig';
import type { PlayerAnimation } from '../../features/player/playerTypes';

export class BootScene extends Phaser.Scene {
  private readonly bridge: GameBridge;
  private assetLoadError: string | null = null;

  public constructor(bridge: GameBridge) {
    super('BootScene');
    this.bridge = bridge;
  }

  public preload(): void {
    this.load.on('loaderror', this.handleLoadError, this);
    assetRegistry.forEach((asset) => {
      if (asset.kind === 'spritesheet') {
        this.load.spritesheet(asset.key, asset.path, {
          frameWidth: asset.frameWidth ?? 1,
          frameHeight: asset.frameHeight ?? 1,
          endFrame: asset.frameCount ? asset.frameCount - 1 : undefined,
        });
        return;
      }
      if (asset.kind === 'audio') {
        this.load.audio(asset.key, asset.path);
        return;
      }
      this.load.image(asset.key, asset.path);
    });
  }

  public create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a1728);
    if (this.assetLoadError) {
      this.add.text(width / 2, height / 2 - 20, '게임 에셋을 불러오지 못했습니다', {
        color: '#ff8b8b',
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.add.text(width / 2, height / 2 + 30, '새로고침 후 다시 시도해 주세요.', {
        color: '#d9e6f2',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
      }).setOrigin(0.5);
      this.bridge.onAssetError?.(this.assetLoadError);
      return;
    }
    this.createPlayerAnimations();
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

  private createPlayerAnimations(): void {
    (Object.entries(PLAYER_ANIMATION_RANGES) as Array<[PlayerAnimation, (typeof PLAYER_ANIMATION_RANGES)[PlayerAnimation]]>).forEach(([animation, range]) => {
      const key = `player-${animation}`;
      if (this.anims.exists(key)) return;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(gameAssetKeys.playerSheet, { start: range.start, end: range.end }),
        frameRate: range.frameRate,
        repeat: range.repeat,
      });
    });
    if (!this.anims.exists('player-jetpack-flame')) {
      this.anims.create({
        key: 'player-jetpack-flame',
        frames: this.anims.generateFrameNumbers('jetpack-flame-spritesheet', { start: 0, end: 3 }),
        frameRate: 18,
        repeat: -1,
      });
    }
  }

  private readonly handleLoadError = (file: Phaser.Loader.File): void => {
    const source = file.src ? ` (${file.src})` : '';
    this.assetLoadError = `필수 에셋 로드 실패${source}`;
  };
}
