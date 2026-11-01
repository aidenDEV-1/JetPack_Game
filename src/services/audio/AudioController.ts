export class AudioController {
  private muted = false;
  private music: HTMLAudioElement | null = null;

  public async playMusic(): Promise<boolean> {
    if (typeof Audio === 'undefined') return false;
    this.music ??= new Audio('/assets/audio/5pm-rush-loop.mp3');
    this.music.loop = true;
    this.music.muted = this.muted;
    try {
      await this.music.play();
      return true;
    } catch {
      return false;
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.music) this.music.muted = muted;
  }

  public isMuted(): boolean { return this.muted; }

  public stop(): void {
    this.music?.pause();
    if (this.music) this.music.currentTime = 0;
  }
}

export const audioController = new AudioController();
