import type { BoosterPhase, BoosterState } from './boosterTypes';
import { BOOSTER_TUNING } from '../../game/config/tuning/booster';

export class BoosterController {
  private state: BoosterState = { active: false, phase: 'idle', remainingMs: 0, graceRemainingMs: 0, tokenCount: 0, hasShield: false };

  public startInitial(): void { this.activate(BOOSTER_TUNING.initialBoostDurationMs, 'intro'); }

  public collectToken(): boolean {
    this.state.tokenCount += 1;
    if (this.state.tokenCount >= 3) {
      this.state.tokenCount = 0;
      this.activate();
      return true;
    }
    return false;
  }

  public collectShield(): boolean {
    if (this.state.hasShield) return false;
    this.state.hasShield = true;
    return true;
  }

  public consumeShield(): boolean {
    if (!this.state.hasShield) return false;
    this.state.hasShield = false;
    return true;
  }

  public activate(durationMs: number = BOOSTER_TUNING.durationMs, phase: BoosterPhase = 'boosting'): void {
    this.state.active = true;
    this.state.phase = phase;
    this.state.remainingMs = durationMs;
    this.state.graceRemainingMs = 0;
  }

  public tick(deltaMs: number): void {
    const delta = Math.max(0, deltaMs);
    if (this.state.active) {
      this.state.remainingMs = Math.max(0, this.state.remainingMs - delta);
      if (this.state.remainingMs === 0) {
        this.state.active = false;
        this.state.phase = BOOSTER_TUNING.graceDurationMs > 0 ? 'grace' : 'complete';
        this.state.graceRemainingMs = BOOSTER_TUNING.graceDurationMs;
      }
      return;
    }
    if (this.state.phase !== 'grace') return;
    this.state.graceRemainingMs = Math.max(0, this.state.graceRemainingMs - delta);
    if (this.state.graceRemainingMs === 0) this.state.phase = 'complete';
  }

  public isInvincible(): boolean { return this.state.active || this.state.phase === 'grace'; }
  public isActive(): boolean { return this.state.active; }
  public snapshot(): BoosterState { return { ...this.state }; }

  public reset(): void {
    this.state = { active: false, phase: 'idle', remainingMs: 0, graceRemainingMs: 0, tokenCount: 0, hasShield: false };
  }
}
