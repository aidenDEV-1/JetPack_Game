import Phaser from 'phaser';

export interface RunDebugSnapshot {
  speedPxPerSecond: number;
  activeChunkId: string | null;
  coinsPerMinute: number;
  obstacleDensityPerMinute: number;
  boosterPhase: string;
}

export class RunDebugOverlay {
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly text: Phaser.GameObjects.Text;
  private visible = false;

  public constructor(scene: Phaser.Scene) {
    this.panel = scene.add.rectangle(18, 118, 276, 120, 0x06101e, 0.9).setOrigin(0).setStrokeStyle(1, 0x52c7ff, 0.65).setDepth(30).setScrollFactor(0).setVisible(false);
    this.text = scene.add.text(30, 130, '', {
      color: '#a9e8ff',
      fontFamily: 'monospace',
      fontSize: '13px',
      lineSpacing: 5,
    }).setDepth(31).setScrollFactor(0).setVisible(false);
  }

  public toggle(): boolean {
    this.visible = !this.visible;
    this.panel.setVisible(this.visible);
    this.text.setVisible(this.visible);
    return this.visible;
  }

  public update(snapshot: RunDebugSnapshot): void {
    if (!this.visible) return;
    this.text.setText([
      'DEV METRICS  [F to hide]',
      `SPEED       ${Math.round(snapshot.speedPxPerSecond)} px/s`,
      `CHUNK       ${snapshot.activeChunkId ?? '—'}`,
      `COINS/MIN   ${snapshot.coinsPerMinute.toFixed(1)}`,
      `OBSTACLES/M  ${snapshot.obstacleDensityPerMinute.toFixed(1)}`,
      `BOOSTER     ${snapshot.boosterPhase.toUpperCase()}`,
    ]);
  }

  public isVisible(): boolean { return this.visible; }
}
