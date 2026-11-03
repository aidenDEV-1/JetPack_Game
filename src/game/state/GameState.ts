export type RunPhase = 'ready' | 'countdown' | 'running' | 'paused' | 'crashed' | 'results';

export interface RunState {
  phase: RunPhase;
  distanceMeters: number;
  runCoins: number;
  tokenCount: number;
  speed: number;
  hasShield: boolean;
  boosterActive: boolean;
  boosterRemainingMs: number;
  boosterPhase: BoosterPhase;
  boosterGraceRemainingMs: number;
  missions: MissionSnapshot;
}

export class GameState {
  private state: RunState;
  private readonly baseSpeed: number;
  private readonly missionTracker: MissionTracker;

  public constructor(baseSpeed: number, random: () => number = Math.random) {
    this.baseSpeed = baseSpeed;
    this.missionTracker = new MissionTracker(random);
    this.state = {
      phase: 'ready', distanceMeters: 0, runCoins: 0, tokenCount: 0, speed: baseSpeed,
      hasShield: false, boosterActive: false, boosterRemainingMs: 0, boosterPhase: 'idle', boosterGraceRemainingMs: 0, missions: this.missionTracker.snapshot(),
    };
  }

  public snapshot(): RunState { return { ...this.state, missions: this.missionTracker.snapshot() }; }

  public start(): void {
    if (this.state.phase === 'ready' || this.state.phase === 'countdown') {
      this.missionTracker.startRun();
      this.state.phase = 'running';
    }
  }

  public pause(): void {
    if (this.state.phase === 'running') this.state.phase = 'paused';
  }

  public resume(): void {
    if (this.state.phase === 'paused') this.state.phase = 'running';
  }

  public crash(): void {
    if (this.state.phase === 'running' || this.state.phase === 'paused') this.state.phase = 'crashed';
  }

  public finishResults(): void {
    if (this.state.phase === 'crashed') this.state.phase = 'results';
  }

  public addDistance(meters: number): void {
    if (this.state.phase === 'running') {
      this.state.distanceMeters += Math.max(0, meters);
      this.missionTracker.recordEvent({ type: 'distance-reached', meters: this.state.distanceMeters });
    }
  }

  public addCrashDistance(meters: number): void {
    if (this.state.phase === 'crashed') this.state.distanceMeters += Math.max(0, meters);
  }

  public collectCoin(amount = 1): void {
    if (this.state.phase !== 'running') return;
    const safeAmount = Math.max(0, amount);
    this.state.runCoins += safeAmount;
    this.missionTracker.recordEvent({ type: 'coin-collected', amount: safeAmount });
  }

  public collectToken(): void {
    if (this.state.phase !== 'running') return;
    this.state.tokenCount = Math.min(3, this.state.tokenCount + 1);
  }

  public setTokenCount(value: number): void {
    this.state.tokenCount = Math.min(3, Math.max(0, Math.floor(value)));
  }

  public setShield(value: boolean): void { this.state.hasShield = value; }

  public setBooster(active: boolean, remainingMs: number, phase: BoosterPhase = active ? 'boosting' : 'idle', graceRemainingMs = 0): void {
    if (active && !this.state.boosterActive) this.missionTracker.recordEvent({ type: 'booster-activated' });
    this.state.boosterActive = active;
    this.state.boosterRemainingMs = active ? Math.max(0, remainingMs) : 0;
    this.state.boosterPhase = phase;
    this.state.boosterGraceRemainingMs = phase === 'grace' ? Math.max(0, graceRemainingMs) : 0;
  }

  public reset(): void {
    this.state = {
      phase: 'ready', distanceMeters: 0, runCoins: 0, tokenCount: 0, speed: this.baseSpeed,
      hasShield: false, boosterActive: false, boosterRemainingMs: 0, boosterPhase: 'idle', boosterGraceRemainingMs: 0, missions: this.missionTracker.snapshot(),
    };
    this.missionTracker.reset();
  }

  public recordMissileEvaded(): void {
    if (this.state.phase === 'running') this.missionTracker.recordEvent({ type: 'missile-evaded' });
  }

  public setSpeed(speed: number): void { this.state.speed = Math.max(0, speed); }
}
import type { BoosterPhase } from '../../features/booster/boosterTypes';
import { MissionTracker } from '../../features/rewards/MissionTracker';
import type { MissionSnapshot } from '../../features/rewards/missionTypes';

