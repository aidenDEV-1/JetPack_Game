import type { PlayerAnimation, PlayerMotionVisualInput, PlayerVisualState } from './playerTypes';

const TRANSITION_DURATION_MS = 120;

export class PlayerAnimationController {
  private state: PlayerVisualState = { animation: 'running', boosting: false, gray: false };
  private transitionElapsedMs = TRANSITION_DURATION_MS;
  private previousGrounded = true;
  private previousBoosterActive = false;

  public snapshot(): PlayerVisualState { return { ...this.state }; }

  public setAnimation(animation: PlayerAnimation): void {
    if (this.state.animation === 'dead') return;
    this.state.animation = animation;
    this.transitionElapsedMs = 0;
    if (animation === 'dead') this.state.gray = true;
  }

  public setBoosting(boosting: boolean): void {
    this.state.boosting = boosting;
  }

  public updateMotion(input: PlayerMotionVisualInput): PlayerAnimation {
    const deltaMs = Math.max(0, input.deltaMs);
    this.transitionElapsedMs += deltaMs;
    if (this.state.animation === 'dead' || this.state.animation === 'hit') return this.state.animation;

    const boosterStarted = input.boosterActive && !this.previousBoosterActive;
    const landed = input.grounded && !this.previousGrounded;
    this.previousGrounded = input.grounded;
    this.previousBoosterActive = input.boosterActive;
    this.state.boosting = input.boosterActive;

    if (this.state.animation === 'takeoff') {
      if (this.transitionElapsedMs < TRANSITION_DURATION_MS) return this.state.animation;
      this.setAnimation('flying');
      return this.state.animation;
    }
    if (this.state.animation === 'landing') {
      if (this.transitionElapsedMs < TRANSITION_DURATION_MS) return this.state.animation;
      this.setAnimation('running');
      return this.state.animation;
    }
    if (boosterStarted || (this.previousGrounded && input.thrusting)) {
      this.setAnimation('takeoff');
      return this.state.animation;
    }
    if (landed) {
      this.setAnimation('landing');
      return this.state.animation;
    }
    if (input.grounded) {
      this.setAnimation(input.boosterActive ? 'flying' : 'running');
      return this.state.animation;
    }
    this.setAnimation(input.thrusting || input.boosterActive ? 'flying' : 'falling');
    return this.state.animation;
  }

  public beginCrash(): boolean {
    if (this.state.animation === 'hit' || this.state.animation === 'dead') return false;
    this.state.animation = 'hit';
    this.transitionElapsedMs = 0;
    return true;
  }

  public finishCrash(): void {
    this.state.animation = 'dead';
    this.state.gray = true;
    this.state.boosting = false;
  }

  public reset(): void {
    this.state = { animation: 'running', boosting: false, gray: false };
    this.transitionElapsedMs = TRANSITION_DURATION_MS;
    this.previousGrounded = true;
    this.previousBoosterActive = false;
  }
}
