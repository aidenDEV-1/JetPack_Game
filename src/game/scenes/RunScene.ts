import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { GameState } from '../state/GameState';
import { KeyboardController } from '../input/KeyboardController';
import { PauseSystem } from '../systems/PauseSystem';
import { updateRunMotion } from '../systems/RunMotionSystem';

export class RunScene extends Phaser.Scene {
  private readonly runState = new GameState(GAME_CONFIG.baseSpeed);
  private readonly pauseSystem = new PauseSystem();
  private keyboard!: KeyboardController;
  private player!: Phaser.GameObjects.Rectangle;
  private playerVelocityY = 0;
  private floorLine!: Phaser.GameObjects.Line;

  public constructor() { super('RunScene'); }

  public create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a1728);
    this.floorLine = this.add.line(0, GAME_CONFIG.floorY, 0, 0, width, 0, 0xf7c948).setOrigin(0);
    this.player = this.add.rectangle(GAME_CONFIG.playerX, GAME_CONFIG.floorY - 42, 70, 84, 0xf7c948);
    this.keyboard = new KeyboardController(this);
    this.runState.start();
    window.addEventListener('blur', this.pauseFromFocusLoss);
    document.addEventListener('visibilitychange', this.pauseFromFocusLoss);
  }

  public update(_time: number, delta: number): void {
    if (this.pauseSystem.isPaused() || this.runState.snapshot().phase !== 'running') return;
    const motion = updateRunMotion({
      y: this.player.y,
      velocityY: this.playerVelocityY,
      deltaSeconds: delta / 1000,
      thrusting: this.keyboard.isThrusting(),
      floorY: GAME_CONFIG.floorY - this.player.height / 2,
      ceilingY: GAME_CONFIG.ceilingY + this.player.height / 2,
      gravity: GAME_CONFIG.gravity,
      liftAcceleration: GAME_CONFIG.liftAcceleration,
      maxUpwardVelocity: GAME_CONFIG.maxUpwardVelocity,
      ceilingBounceVelocity: GAME_CONFIG.ceilingBounceVelocity,
    });
    this.player.y = motion.y;
    this.playerVelocityY = motion.velocityY;
    this.runState.addDistance((GAME_CONFIG.baseSpeed * delta / 1000) / GAME_CONFIG.pixelsPerMeter);
  }

  public pauseFromSettings(): void { this.pauseRun(); }

  public resumeFromSettings(onCount: (value: 3 | 2 | 1) => void, onComplete: () => void): void {
    this.pauseSystem.resumeWithCountdown(onCount, () => { this.runState.resume(); onComplete(); });
  }

  private readonly pauseFromFocusLoss = (): void => {
    if (document.visibilityState === 'hidden' || !document.hasFocus()) this.pauseRun();
  };

  private pauseRun(): void {
    this.pauseSystem.pause();
    this.runState.pause();
  }

  public shutdown(): void {
    window.removeEventListener('blur', this.pauseFromFocusLoss);
    document.removeEventListener('visibilitychange', this.pauseFromFocusLoss);
    this.pauseSystem.cancel();
    this.floorLine.destroy();
  }
}
