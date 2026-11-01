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
}

export class GameState {
  private state: RunState;

  public constructor(baseSpeed: number) {
    this.state = {
      phase: 'ready', distanceMeters: 0, runCoins: 0, tokenCount: 0, speed: baseSpeed,
      hasShield: false, boosterActive: false, boosterRemainingMs: 0,
    };
  }

  public snapshot(): RunState { return { ...this.state }; }

  public start(): void {
    if (this.state.phase === 'ready' || this.state.phase === 'countdown') this.state.phase = 'running';
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

  public addDistance(meters: number): void {
    if (this.state.phase === 'running') this.state.distanceMeters += Math.max(0, meters);
  }

  public collectCoin(amount = 1): void {
    if (this.state.phase !== 'running') return;
    this.state.runCoins += Math.max(0, amount);
  }

  public collectToken(): void {
    if (this.state.phase !== 'running') return;
    this.state.tokenCount = Math.min(3, this.state.tokenCount + 1);
  }

  public setTokenCount(value: number): void {
    this.state.tokenCount = Math.min(3, Math.max(0, Math.floor(value)));
  }

  public setShield(value: boolean): void { this.state.hasShield = value; }

  public setBooster(active: boolean, remainingMs: number): void {
    this.state.boosterActive = active;
    this.state.boosterRemainingMs = active ? Math.max(0, remainingMs) : 0;
  }

  public reset(): void {
    this.state = {
      phase: 'ready', distanceMeters: 0, runCoins: 0, tokenCount: 0, speed: this.state.speed,
      hasShield: false, boosterActive: false, boosterRemainingMs: 0,
    };
  }

  public setSpeed(speed: number): void { this.state.speed = Math.max(0, speed); }
}
