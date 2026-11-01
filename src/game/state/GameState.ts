export type RunPhase = 'ready' | 'countdown' | 'running' | 'paused' | 'crashed' | 'results';

export interface RunState {
  phase: RunPhase;
  distanceMeters: number;
  runCoins: number;
  tokenCount: number;
  speed: number;
}

export class GameState {
  private state: RunState;

  public constructor(baseSpeed: number) {
    this.state = { phase: 'ready', distanceMeters: 0, runCoins: 0, tokenCount: 0, speed: baseSpeed };
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

  public setSpeed(speed: number): void { this.state.speed = Math.max(0, speed); }
}
