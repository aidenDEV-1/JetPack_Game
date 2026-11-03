import type { RunDebugSnapshot } from './RunDebugOverlay';

export class RunDebugMetrics {
  private elapsedMs = 0;
  private coinsCollected = 0;
  private obstaclesSpawned = 0;

  public update(deltaMs: number): void { this.elapsedMs += Math.max(0, deltaMs); }
  public recordCoin(amount = 1): void { this.coinsCollected += Math.max(0, amount); }
  public recordObstacle(): void { this.obstaclesSpawned += 1; }
  public reset(): void { this.elapsedMs = 0; this.coinsCollected = 0; this.obstaclesSpawned = 0; }

  public snapshot(speedPxPerSecond: number, activeChunkId: string | null, boosterPhase: string): RunDebugSnapshot {
    const minutes = this.elapsedMs / 60000;
    return {
      speedPxPerSecond,
      activeChunkId,
      coinsPerMinute: minutes > 0 ? this.coinsCollected / minutes : 0,
      obstacleDensityPerMinute: minutes > 0 ? this.obstaclesSpawned / minutes : 0,
      boosterPhase,
    };
  }
}
