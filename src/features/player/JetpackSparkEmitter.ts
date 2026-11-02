import Phaser from 'phaser';

const MAX_SPARKS = 12;

export class JetpackSparkEmitter extends Phaser.GameObjects.Particles.ParticleEmitter {
  public constructor(scene: Phaser.Scene, textureKey: string) {
    super(scene, 0, 0, textureKey, {
      frame: 3,
      active: false,
      frequency: 95,
      quantity: 1,
      lifespan: { min: 120, max: 220 },
      speed: { min: 20, max: 70 },
      angle: { min: 155, max: 205 },
      scale: { start: 0.08, end: 0 },
      alpha: { start: 0.95, end: 0 },
      maxParticles: MAX_SPARKS,
      maxAliveParticles: MAX_SPARKS,
    });
    this.setVisible(false);
  }

  public setEmitterActive(active: boolean): void {
    this.setVisible(active);
    if (active) {
      this.start();
    } else {
      this.stop(true);
    }
  }

  public getBoundedCount(): number { return MAX_SPARKS; }

  public reset(): void {
    this.stop(true);
    this.setVisible(false);
  }
}
