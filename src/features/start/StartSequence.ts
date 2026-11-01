export interface StartSequenceOptions {
  onClockChange: (value: '4:59:59' | '5:00:00') => void;
  onAlarm: () => void;
  onComplete: () => void;
}

export interface StartSequenceContract {
  play(): Promise<void>;
  cancel(): void;
}

export class StartSequence implements StartSequenceContract {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private cancelled = false;

  public constructor(private readonly options: StartSequenceOptions) {}

  public async play(): Promise<void> {
    this.cancelled = false;
    this.options.onClockChange('4:59:59');
    await this.wait(1200);
    if (this.cancelled) return;
    this.options.onClockChange('5:00:00');
    this.options.onAlarm();
    await this.wait(800);
    if (this.cancelled) return;
    await this.wait(1000);
    if (!this.cancelled) this.options.onComplete();
  }

  public cancel(): void {
    this.cancelled = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private wait(durationMs: number): Promise<void> {
    return new Promise((resolve) => { this.timer = setTimeout(resolve, durationMs); });
  }
}
