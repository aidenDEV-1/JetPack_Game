import Phaser from 'phaser';

export const MAX_SPEED_LINES = 8;

export class SpeedLineEffect {
  private readonly lines: Phaser.GameObjects.Graphics[];
  private active = false;
  private intensity = 1;

  public constructor(private readonly scene: Phaser.Scene, count = MAX_SPEED_LINES) {
    this.lines = Array.from({ length: Math.min(MAX_SPEED_LINES, Math.max(0, count)) }, (_, index) => {
      const line = scene.add.graphics().setDepth(3).setVisible(false);
      line.setData('seed', index);
      return line;
    });
  }

  public start(intensity = 1): void {
    if (this.active) {
      this.intensity = Math.max(1, intensity);
      return;
    }
    this.active = true;
    this.intensity = Math.max(1, intensity);
    this.lines.forEach((line, index) => {
      const seed = Number(line.getData('seed'));
      line.setPosition(this.scene.scale.width + 40 + ((seed * 173) % 260), 150 + ((seed * 97) % 360));
      line.setVisible(true).setAlpha(0.25 + (index % 3) * 0.08);
      this.draw(line, index);
    });
  }

  public stop(): void {
    this.active = false;
    this.lines.forEach((line) => { line.clear(); line.setVisible(false); });
  }

  public update(deltaMs: number): void {
    if (!this.active) return;
    const delta = Math.max(0, deltaMs) / 1000;
    this.lines.forEach((line, index) => {
      line.x -= (480 + this.intensity * 90) * delta;
      if (line.x < -180) line.x = this.scene.scale.width + 40 + index * 36;
      this.draw(line, index);
    });
  }

  public get activeCount(): number { return this.active ? this.lines.length : 0; }
  public get poolSize(): number { return this.lines.length; }

  public destroy(): void {
    this.lines.forEach((line) => line.destroy());
  }

  private draw(line: Phaser.GameObjects.Graphics, index: number): void {
    const length = 48 + (index % 4) * 18 + this.intensity * 8;
    line.clear();
    line.lineStyle(index % 3 === 0 ? 3 : 2, index % 2 === 0 ? 0x6dd7ff : 0xffffff, 0.55);
    line.lineBetween(0, 0, -length, 0);
  }
}
