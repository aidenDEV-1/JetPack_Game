import Phaser from 'phaser';

export class KeyboardController {
  private readonly space: Phaser.Input.Keyboard.Key;

  public constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) throw new Error('키보드 입력을 사용할 수 없습니다.');
    this.space = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  public isThrusting(): boolean { return this.space.isDown; }
}
