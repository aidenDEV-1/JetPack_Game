import type { PlayerAnimation, PlayerVisualState } from './playerTypes';

export class PlayerAnimationController {
  private state: PlayerVisualState = { animation: 'running', boosting: false, gray: false };

  public snapshot(): PlayerVisualState { return { ...this.state }; }

  public setAnimation(animation: PlayerAnimation): void {
    if (this.state.animation === 'fallen') return;
    this.state.animation = animation;
    if (animation === 'fallen') this.state.gray = true;
  }

  public setBoosting(boosting: boolean): void {
    this.state.boosting = boosting;
    if (boosting && this.state.animation !== 'crashing' && this.state.animation !== 'fallen') this.state.animation = 'boosting';
  }

  public beginCrash(): boolean {
    if (this.state.animation === 'crashing' || this.state.animation === 'fallen') return false;
    this.state.animation = 'crashing';
    return true;
  }

  public finishCrash(): void {
    this.state.animation = 'fallen';
    this.state.gray = true;
    this.state.boosting = false;
  }
}
