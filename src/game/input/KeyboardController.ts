import Phaser from 'phaser';

export class KeyboardController {
  private readonly space: Phaser.Input.Keyboard.Key;
  private readonly debug: Phaser.Input.Keyboard.Key;
  private readonly metrics: Phaser.Input.Keyboard.Key;

  public constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) throw new Error('키보드 입력을 사용할 수 없습니다.');
    this.space = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.debug = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.metrics = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
  }

  public isThrusting(): boolean { return this.space.isDown; }

  public consumeDebugToggle(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.debug);
  }

  public consumeMetricsToggle(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.metrics);
  }
}
