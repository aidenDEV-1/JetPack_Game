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
import { CollectibleField } from '../../features/items/CollectibleField';
import type { ItemKind } from '../../features/items/itemTypes';
import { showItemPickupFeedback } from '../../features/items/ItemPickupFeedback';
import { ObstacleField } from '../../features/obstacles/ObstacleField';
import type { CollisionOutcome } from '../../features/obstacles/CollisionResolver';
import { BoosterFlightController } from '../../features/booster/BoosterFlightController';
import { showBoosterFeedback } from '../../features/booster/BoosterFeedback';
import { ResultsController } from '../../features/results/ResultsController';
import { registerGameTestApi } from '../test/GameTestApi';

export class RunScene extends Phaser.Scene {
  private readonly runState = new GameState(GAME_CONFIG.baseSpeed);
  private readonly pauseSystem = new PauseSystem();
  private readonly boosterController = new BoosterController();
  private readonly boosterFlight = new BoosterFlightController();
  private readonly resultsController = new ResultsController();
  private readonly bridge: GameBridge;
  private keyboard!: KeyboardController;
  private player!: PlayerEntity;
  private playerVelocityY = 0;
  private floorLine!: Phaser.GameObjects.Line;
  private backgroundController!: BackgroundController;
  private collectibleField!: CollectibleField;
  private obstacleField!: ObstacleField;
  private lastSnapshotAt = -Infinity;
  private lastSnapshotKey = '';
  private crashHandled = false;
  private runEndNotified = false;

  public constructor(bridge: GameBridge) {
    super('RunScene');
    this.bridge = bridge;
  }

  public create(): void {
    const { width } = this.scale;
    this.backgroundController = new BackgroundController(this);
    this.floorLine = this.add.line(0, GAME_CONFIG.floorY, 0, 0, width, 0, 0xf7c948).setOrigin(0).setDepth(4);
    this.player = new PlayerEntity(this, { x: GAME_CONFIG.playerX, floorY: GAME_CONFIG.floorY, maxHeightY: GAME_CONFIG.ceilingY, scale: 1 });
    this.obstacleField = new ObstacleField(this, { onHit: (outcome) => this.handleObstacleHit(outcome) });
    this.collectibleField = new CollectibleField(this, {
      onCollect: (kind, x, y) => this.handleItemCollect(kind, x, y),
      onShieldPickupSpawned: () => this.obstacleField.setShieldPickupAhead(true),
    });
    this.keyboard = new KeyboardController(this);
    this.registerDevTestApi();
    window.addEventListener('blur', this.pauseFromFocusLoss);
    document.addEventListener('visibilitychange', this.pauseFromFocusLoss);
    this.emitSnapshot(true);
  }

  public update(_time: number, delta: number): void {
    const state = this.runState.snapshot();
    if (this.pauseSystem.isPaused() || state.phase !== 'running') return;
    const progression = getProgression(state.distanceMeters);
    this.boosterController.tick(delta);
    const flight = this.boosterFlight.update(delta);
    const worldSpeed = GAME_CONFIG.baseSpeed * progression.speedMultiplier * flight.worldSpeedMultiplier;
    this.player.x = flight.playerX;
    this.runState.setSpeed(worldSpeed);
    this.runState.setBooster(flight.active, flight.remainingMs);
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
    this.player.setBoosting(flight.active);
    this.player.setAnimation(flight.active ? 'boosting' : motion.grounded ? 'running' : this.keyboard.isThrusting() ? 'flying' : 'falling');
    this.runState.addDistance((worldSpeed * delta / 1000) / GAME_CONFIG.pixelsPerMeter);
    this.collectibleField.update(delta, this.runState.snapshot().distanceMeters, worldSpeed, this.player.getCollisionBounds());
    this.obstacleField.update(
      delta,
      {
        distanceMeters: this.runState.snapshot().distanceMeters,
        speed: worldSpeed,
        hasShieldPickupAhead: this.collectibleField.hasShieldPickupAhead(),
        forcedPatternUsedInSegment: false,
      },
      this.player.getCollisionBounds(),
      flight.active,
      this.runState.snapshot().hasShield,
    );
    this.emitSnapshot();
  }

  public beginRun(): void {
    if (this.runState.snapshot().phase !== 'ready') return;
    this.runState.start();
    this.boosterController.startInitial();
    this.boosterFlight.activate();
    showBoosterFeedback(this);
    const booster = this.boosterController.snapshot();
    this.runState.setBooster(booster.active, booster.remainingMs);
    this.player.setBoosting(true);
    this.emitSnapshot(true);
  }

  public restartRun(): void {
    this.pauseSystem.reset();
    this.runState.reset();
    this.resultsController.reset();
    this.boosterController.reset();
    this.boosterFlight.reset();
    this.collectibleField.reset();
    this.obstacleField.reset();
    this.backgroundController.reset();
    this.playerVelocityY = 0;
    this.crashHandled = false;
    this.runEndNotified = false;
    this.player.reset();
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

  public spawnDemoItems(): void { this.collectibleField.spawnDemoItems(); }
  public spawnDemoObstacle(): void { this.obstacleField.spawnDemoObstacle(); }
  public activateDemoBooster(): void {
    this.boosterController.activate();
    this.boosterFlight.activate();
    showBoosterFeedback(this);
    this.runState.setBooster(true, this.boosterFlight.snapshot().remainingMs);
    this.emitSnapshot(true);
  }

  public deactivateDemoBooster(): void {
    this.boosterController.reset();
    this.boosterFlight.reset();
    this.runState.setBooster(false, 0);
    this.emitSnapshot(true);
  }

  private readonly pauseFromFocusLoss = (): void => {
    if (document.visibilityState === 'hidden' || !document.hasFocus()) this.pauseRun();
  };

  private pauseRun(): void {
    this.pauseSystem.pause();
    this.runState.pause();
    this.emitSnapshot(true);
  }

  private handleItemCollect(kind: ItemKind, x: number, y: number): void {
    showItemPickupFeedback(this, kind, x, y);
    if (kind === 'coin') this.runState.collectCoin(1);
    if (kind === 'token') {
      this.runState.collectToken();
      if (this.boosterController.collectToken()) {
        this.boosterFlight.activate();
        showBoosterFeedback(this);
      }
      this.runState.setTokenCount(this.boosterController.snapshot().tokenCount);
    }
    if (kind === 'shield' && this.boosterController.collectShield()) {
      this.runState.setShield(true);
      this.collectibleField.setShieldHeld(true);
    }
    const booster = this.boosterController.snapshot();
    this.runState.setBooster(booster.active, booster.remainingMs);
    this.emitSnapshot(true);
  }

  private handleObstacleHit(outcome: CollisionOutcome): void {
    if (outcome === 'blocked-by-shield' && this.boosterController.consumeShield()) {
      this.runState.setShield(false);
      this.collectibleField.setShieldHeld(false);
      this.emitSnapshot(true);
      return;
    }
    if (outcome !== 'crash') return;
    if (this.crashHandled) return;
    this.crashHandled = true;
    this.resultsController.beginCrash();
    this.runState.crash();
    this.emitSnapshot(true);
    const crashAnimation = this.player.crash();
    void crashAnimation.then(() => {
      this.resultsController.finishCrash();
      if (this.resultsController.getPhase() !== 'results' || this.runEndNotified) return;
      this.runEndNotified = true;
      this.runState.finishResults();
      const snapshot = this.runState.snapshot();
      this.emitSnapshot(true);
      this.bridge.onRunEnd(snapshot);
    });
  }

  private registerDevTestApi(): void {
    registerGameTestApi({
      getSnapshot: () => this.getSnapshot(),
      spawnDemoItems: () => this.spawnDemoItems(),
      spawnDemoObstacle: () => this.spawnDemoObstacle(),
      activateBooster: () => this.activateDemoBooster(),
      deactivateBooster: () => this.deactivateDemoBooster(),
      forceCrash: () => {
        if (this.runState.snapshot().phase === 'running') this.handleObstacleHit('crash');
      },
      getPlayerVisualSnapshot: () => this.player.getVisualDebugSnapshot(),
      getObstacleVisualSnapshot: () => this.obstacleField.getVisualDebugSnapshot(),
      getBoosterSnapshot: () => this.boosterFlight.snapshot(),
    });
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

