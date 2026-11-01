import Phaser from 'phaser';
import type { GameBridge } from '../PhaserGame';
import { GAME_CONFIG } from '../config/gameConfig';
import { GameState } from '../state/GameState';
import { KeyboardController } from '../input/KeyboardController';
import { PauseSystem } from '../systems/PauseSystem';
import { updateRunMotion } from '../systems/RunMotionSystem';
import { PlayerEntity } from '../../features/player/PlayerEntity';
import { getProgression } from '../../features/progression/DistanceProgression';
import { BackgroundController } from '../../features/background/BackgroundController';
import { BoosterController } from '../../features/booster/BoosterController';

export class RunScene extends Phaser.Scene {
  private readonly runState = new GameState(GAME_CONFIG.baseSpeed);
  private readonly pauseSystem = new PauseSystem();
  private readonly boosterController = new BoosterController();
  private readonly bridge: GameBridge;
  private keyboard!: KeyboardController;
  private player!: PlayerEntity;
  private playerVelocityY = 0;
  private floorLine!: Phaser.GameObjects.Line;
  private backgroundController!: BackgroundController;
  private lastSnapshotAt = -Infinity;
  private lastSnapshotKey = '';

  public constructor(bridge: GameBridge) {
    super('RunScene');
    this.bridge = bridge;
  }

  public create(): void {
    const { width } = this.scale;
    this.backgroundController = new BackgroundController(this);
    this.floorLine = this.add.line(0, GAME_CONFIG.floorY, 0, 0, width, 0, 0xf7c948).setOrigin(0).setDepth(4);
    this.player = new PlayerEntity(this, { x: GAME_CONFIG.playerX, floorY: GAME_CONFIG.floorY, maxHeightY: GAME_CONFIG.ceilingY, scale: 1 });
    this.keyboard = new KeyboardController(this);
    window.addEventListener('blur', this.pauseFromFocusLoss);
    document.addEventListener('visibilitychange', this.pauseFromFocusLoss);
    this.emitSnapshot(true);
  }

  public update(_time: number, delta: number): void {
    const state = this.runState.snapshot();
    if (this.pauseSystem.isPaused() || state.phase !== 'running') return;
    const progression = getProgression(state.distanceMeters);
    this.boosterController.tick(delta);
    const booster = this.boosterController.snapshot();
    const worldSpeed = GAME_CONFIG.baseSpeed * progression.speedMultiplier;
    this.runState.setSpeed(worldSpeed);
    this.runState.setBooster(booster.active, booster.remainingMs);
    this.backgroundController.update(delta, worldSpeed, state.distanceMeters);
    const motion = updateRunMotion({
      y: this.player.y,
      velocityY: this.playerVelocityY,
      deltaSeconds: delta / 1000,
      thrusting: this.keyboard.isThrusting(),
      floorY: GAME_CONFIG.floorY - 55,
      ceilingY: GAME_CONFIG.ceilingY + 55,
      gravity: GAME_CONFIG.gravity,
      liftAcceleration: GAME_CONFIG.liftAcceleration,
      maxUpwardVelocity: GAME_CONFIG.maxUpwardVelocity,
      ceilingBounceVelocity: GAME_CONFIG.ceilingBounceVelocity,
    });
    this.player.y = motion.y;
    this.playerVelocityY = motion.velocityY;
    this.player.setBoosting(booster.active);
    this.player.setAnimation(booster.active ? 'boosting' : motion.grounded ? 'running' : this.keyboard.isThrusting() ? 'flying' : 'falling');
    this.runState.addDistance((worldSpeed * delta / 1000) / GAME_CONFIG.pixelsPerMeter);
    this.emitSnapshot();
  }

  public beginRun(): void {
    this.runState.start();
    this.boosterController.startInitial();
    const booster = this.boosterController.snapshot();
    this.runState.setBooster(booster.active, booster.remainingMs);
    this.player.setBoosting(true);
    this.emitSnapshot(true);
  }

  public pauseFromSettings(): void { this.pauseRun(); }

  public resumeFromSettings(onCount: (value: 3 | 2 | 1) => void, onComplete: () => void): void {
    this.pauseSystem.resumeWithCountdown(onCount, () => {
      this.runState.resume();
      this.emitSnapshot(true);
      onComplete();
    });
  }

  public getSnapshot() { return this.runState.snapshot(); }

  private readonly pauseFromFocusLoss = (): void => {
    if (document.visibilityState === 'hidden' || !document.hasFocus()) this.pauseRun();
  };

  private pauseRun(): void {
    this.pauseSystem.pause();
    this.runState.pause();
    this.emitSnapshot(true);
  }

  private emitSnapshot(force = false): void {
    const snapshot = this.runState.snapshot();
    const snapshotKey = JSON.stringify(snapshot);
    const now = this.time.now;
    if (!force && snapshotKey === this.lastSnapshotKey && now - this.lastSnapshotAt < 100) return;
    this.lastSnapshotAt = now;
    this.lastSnapshotKey = snapshotKey;
    this.bridge.onStateChange(snapshot);
  }

  public shutdown(): void {
    window.removeEventListener('blur', this.pauseFromFocusLoss);
    document.removeEventListener('visibilitychange', this.pauseFromFocusLoss);
    this.pauseSystem.cancel();
    this.floorLine.destroy();
  }
}

