import { GAME_CONFIG } from '../../game/config/gameConfig';
import { BOOSTER_TUNING } from '../../game/config/tuning/booster';
import type { BoosterFlightPhase } from './boosterTypes';

export interface BoosterFlightSnapshot {
  active: boolean;
  phase: BoosterFlightPhase;
  playerX: number;
  worldSpeedMultiplier: number;
  remainingMs: number;
}

export class BoosterFlightController {
  private active = false;
  private elapsedMs = 0;
  private playerX: number = GAME_CONFIG.playerX;
  private activeDurationMs: number = BOOSTER_TUNING.durationMs;

  public activate(durationMs: number = BOOSTER_TUNING.durationMs): void {
    this.active = true;
    this.elapsedMs = 0;
    this.playerX = GAME_CONFIG.playerX;
    this.activeDurationMs = Math.max(1, durationMs);
  }

  public update(deltaMs: number): BoosterFlightSnapshot {
    if (!this.active) return this.snapshot();
    const durationMs = this.activeDurationMs;
    const durationScale = durationMs / BOOSTER_TUNING.durationMs;
    const travelOutMs = BOOSTER_TUNING.travelOutMs * durationScale;
    const holdMs = BOOSTER_TUNING.holdMs * durationScale;
    const travelBackMs = BOOSTER_TUNING.travelBackMs * durationScale;
    this.elapsedMs = Math.min(durationMs, this.elapsedMs + Math.max(0, deltaMs));
    if (this.elapsedMs < travelOutMs) {
      const progress = this.easeOutCubic(this.elapsedMs / travelOutMs);
      this.playerX = this.interpolate(GAME_CONFIG.playerX, GAME_CONFIG.width - 120, progress);
    } else if (this.elapsedMs < travelOutMs + holdMs) {
      this.playerX = GAME_CONFIG.width - 120;
    } else if (this.elapsedMs < durationMs) {
      const progress = this.easeInCubic((this.elapsedMs - travelOutMs - holdMs) / travelBackMs);
      this.playerX = this.interpolate(GAME_CONFIG.width - 120, GAME_CONFIG.playerX, progress);
    } else {
      this.active = false;
      this.playerX = GAME_CONFIG.playerX;
    }
    return this.snapshot();
  }

  public snapshot(): BoosterFlightSnapshot {
    return {
      active: this.active,
      phase: this.getPhase(),
      playerX: this.playerX,
      worldSpeedMultiplier: this.active ? BOOSTER_TUNING.speedMultiplier : 1,
      remainingMs: this.active ? Math.max(0, this.activeDurationMs - this.elapsedMs) : 0,
    };
  }

  public reset(): void {
    this.active = false;
    this.elapsedMs = 0;
    this.playerX = GAME_CONFIG.playerX;
    this.activeDurationMs = BOOSTER_TUNING.durationMs;
  }

  private getPhase(): BoosterFlightPhase {
    if (!this.active) return 'idle';
    const durationScale = this.activeDurationMs / BOOSTER_TUNING.durationMs;
    const travelOutMs = BOOSTER_TUNING.travelOutMs * durationScale;
    const holdMs = BOOSTER_TUNING.holdMs * durationScale;
    if (this.elapsedMs < travelOutMs) return 'travelling-out';
    if (this.elapsedMs < travelOutMs + holdMs) return 'holding';
    return 'travelling-back';
  }

  private interpolate(start: number, end: number, progress: number): number { return start + (end - start) * progress; }
  private easeOutCubic(progress: number): number { return 1 - (1 - progress) ** 3; }
  private easeInCubic(progress: number): number { return progress ** 3; }
}

