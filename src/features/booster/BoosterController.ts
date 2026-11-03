import type { BoosterState } from './boosterTypes';
import { BOOSTER_TUNING } from '../../game/config/tuning/booster';

export class BoosterController {
  private state: BoosterState = { active: false, remainingMs: 0, tokenCount: 0, hasShield: false };

  public startInitial(): void { this.activate(BOOSTER_TUNING.initialBoostDurationMs); }

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

  public activate(durationMs: number = BOOSTER_TUNING.durationMs): void {
    this.state.active = true;
    this.state.remainingMs = durationMs;
  }

  public tick(deltaMs: number): void {
    if (!this.state.active) return;
    this.state.remainingMs = Math.max(0, this.state.remainingMs - Math.max(0, deltaMs));
    if (this.state.remainingMs === 0) this.state.active = false;
  }

  public isInvincible(): boolean { return this.state.active; }
  public isActive(): boolean { return this.state.active; }
  public snapshot(): BoosterState { return { ...this.state }; }

  public reset(): void {
    this.state = { active: false, remainingMs: 0, tokenCount: 0, hasShield: false };
  }
}
