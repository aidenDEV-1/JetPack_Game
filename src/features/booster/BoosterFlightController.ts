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

  public activate(): void {
    this.active = true;
    this.elapsedMs = 0;
    this.playerX = GAME_CONFIG.playerX;
  }

  public update(deltaMs: number): BoosterFlightSnapshot {
    if (!this.active) return this.snapshot();
    const durationMs = BOOSTER_TUNING.travelOutMs + BOOSTER_TUNING.holdMs + BOOSTER_TUNING.travelBackMs;
    this.elapsedMs = Math.min(durationMs, this.elapsedMs + Math.max(0, deltaMs));
    if (this.elapsedMs < BOOSTER_TUNING.travelOutMs) {
      const progress = this.easeOutCubic(this.elapsedMs / BOOSTER_TUNING.travelOutMs);
      this.playerX = this.interpolate(GAME_CONFIG.playerX, GAME_CONFIG.width - 120, progress);
    } else if (this.elapsedMs < BOOSTER_TUNING.travelOutMs + BOOSTER_TUNING.holdMs) {
      this.playerX = GAME_CONFIG.width - 120;
    } else if (this.elapsedMs < durationMs) {
      const progress = this.easeInCubic((this.elapsedMs - BOOSTER_TUNING.travelOutMs - BOOSTER_TUNING.holdMs) / BOOSTER_TUNING.travelBackMs);
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
      remainingMs: this.active ? Math.max(0, (BOOSTER_TUNING.travelOutMs + BOOSTER_TUNING.holdMs + BOOSTER_TUNING.travelBackMs) - this.elapsedMs) : 0,
    };
  }

  public reset(): void {
    this.active = false;
    this.elapsedMs = 0;
    this.playerX = GAME_CONFIG.playerX;
  }

  private getPhase(): BoosterFlightPhase {
    if (!this.active) return 'idle';
    if (this.elapsedMs < BOOSTER_TUNING.travelOutMs) return 'travelling-out';
    if (this.elapsedMs < BOOSTER_TUNING.travelOutMs + BOOSTER_TUNING.holdMs) return 'holding';
    return 'travelling-back';
  }

  private interpolate(start: number, end: number, progress: number): number { return start + (end - start) * progress; }
  private easeOutCubic(progress: number): number { return 1 - (1 - progress) ** 3; }
  private easeInCubic(progress: number): number { return progress ** 3; }
}

