import { GAME_CONFIG } from '../../game/config/gameConfig';
import type { BoosterFlightPhase } from './boosterTypes';

const TRAVEL_OUT_MS = 1500;
const HOLD_MS = 2000;
const TRAVEL_BACK_MS = 1500;
const BOOSTER_DURATION_MS = TRAVEL_OUT_MS + HOLD_MS + TRAVEL_BACK_MS;
const BOOST_SPEED_MULTIPLIER = 2.4;

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
    this.elapsedMs = Math.min(BOOSTER_DURATION_MS, this.elapsedMs + Math.max(0, deltaMs));
    if (this.elapsedMs < TRAVEL_OUT_MS) {
      const progress = this.easeOutCubic(this.elapsedMs / TRAVEL_OUT_MS);
      this.playerX = this.interpolate(GAME_CONFIG.playerX, GAME_CONFIG.width - 120, progress);
    } else if (this.elapsedMs < TRAVEL_OUT_MS + HOLD_MS) {
      this.playerX = GAME_CONFIG.width - 120;
    } else if (this.elapsedMs < BOOSTER_DURATION_MS) {
      const progress = this.easeInCubic((this.elapsedMs - TRAVEL_OUT_MS - HOLD_MS) / TRAVEL_BACK_MS);
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
      worldSpeedMultiplier: this.active ? BOOST_SPEED_MULTIPLIER : 1,
      remainingMs: this.active ? Math.max(0, BOOSTER_DURATION_MS - this.elapsedMs) : 0,
    };
  }

  private getPhase(): BoosterFlightPhase {
    if (!this.active) return 'idle';
    if (this.elapsedMs < TRAVEL_OUT_MS) return 'travelling-out';
    if (this.elapsedMs < TRAVEL_OUT_MS + HOLD_MS) return 'holding';
    return 'travelling-back';
  }

  private interpolate(start: number, end: number, progress: number): number { return start + (end - start) * progress; }
  private easeOutCubic(progress: number): number { return 1 - (1 - progress) ** 3; }
  private easeInCubic(progress: number): number { return progress ** 3; }
}

