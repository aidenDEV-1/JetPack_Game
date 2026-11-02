import Phaser from 'phaser';

export type JetpackFlameIntensity = 'normal' | 'strong';

export class JetpackFlameVisual extends Phaser.GameObjects.Sprite {
  public constructor(scene: Phaser.Scene, textureKey: string) {
    super(scene, 0, 0, textureKey, 0);
    this.setOrigin(0.5, 0.5);
    this.setVisible(false);
  }

  public setFlameActive(active: boolean, intensity: JetpackFlameIntensity): void {
    if (!active) {
      this.stop();
      this.setVisible(false);
      this.setScale(0.42);
      return;
    }
    this.setVisible(true);
    this.setScale(intensity === 'strong' ? 0.56 : 0.42);
    this.play('player-jetpack-flame', true);
  }

  public reset(): void {
    this.stop();
    this.setFrame(0);
    this.setVisible(false);
    this.setScale(0.42);
  }
}
