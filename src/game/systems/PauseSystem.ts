export class PauseSystem {
  private paused = false;
  private countdownTimer: ReturnType<typeof setTimeout> | null = null;

  public isPaused(): boolean { return this.paused; }

  public pause(): void { this.paused = true; }

  public resumeWithCountdown(onCount: (value: 3 | 2 | 1) => void, onComplete: () => void): void {
    if (!this.paused) return;
    let count = 3;
    const next = () => {
      onCount(count as 3 | 2 | 1);
      if (count === 1) {
        this.paused = false;
        onComplete();
        this.countdownTimer = null;
        return;
      }
      count -= 1;
      this.countdownTimer = setTimeout(next, 1000);
    };
    next();
  }

  public cancel(): void {
    if (this.countdownTimer) clearTimeout(this.countdownTimer);
    this.countdownTimer = null;
  }

  public reset(): void {
    this.cancel();
    this.paused = false;
  }
}
