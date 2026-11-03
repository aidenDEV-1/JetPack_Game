import { AUDIO_TUNING } from '../../game/config/tuning/audio';

export type SfxId = 'alarm' | 'booster-start' | 'booster-end' | 'coin' | 'laser-warning' | 'missile-launch' | 'shield-hit' | 'crash' | 'result';

const SFX_PATHS: Record<SfxId, string> = {
  alarm: '/assets/audio/alarm.wav',
  'booster-start': '/assets/audio/booster-start.wav',
  'booster-end': '/assets/audio/booster-end.wav',
  coin: '/assets/audio/coin.wav',
  'laser-warning': '/assets/audio/laser-warning.wav',
  'missile-launch': '/assets/audio/missile-launch.wav',
  'shield-hit': '/assets/audio/shield-hit.wav',
  crash: '/assets/audio/crash.wav',
  result: '/assets/audio/result.wav',
};

export class AudioController {
  private muted = false;
  private music: HTMLAudioElement | null = null;
  private readonly activeSfx = new Set<HTMLAudioElement>();
  private audioContext: AudioContext | null = null;
  private lastCoinAt = -Infinity;
  private coinPitchStep = 0;

  public async playMusic(): Promise<boolean> {
    if (typeof Audio === 'undefined') return false;
    this.music ??= new Audio('/assets/audio/5pm-rush-loop.wav');
    this.music.loop = true;
    this.music.volume = AUDIO_TUNING.musicVolume;
    this.music.muted = this.muted;
    try {
      await this.resume();
      await this.music.play();
      return true;
    } catch {
      return false;
    }
  }

  public playSfx(id: SfxId, options: { rate?: number; volume?: number } = {}): boolean {
    if (typeof Audio === 'undefined' || this.muted || this.activeSfx.size >= AUDIO_TUNING.maxConcurrentSfx) return false;
    const audio = new Audio(SFX_PATHS[id]);
    const now = Date.now();
    if (id === 'coin') {
      this.coinPitchStep = now - this.lastCoinAt < 260 ? Math.min(AUDIO_TUNING.maxCoinPitchSteps, this.coinPitchStep + 1) : 0;
      this.lastCoinAt = now;
    }
    const coinRate = id === 'coin' ? 1 + this.coinPitchStep * AUDIO_TUNING.coinPitchStep : 1;
    audio.playbackRate = Math.max(0.5, Math.min(2, (options.rate ?? 1) * coinRate));
    audio.volume = Math.max(0, Math.min(1, AUDIO_TUNING.sfxVolume * (options.volume ?? 1)));
    audio.muted = this.muted;
    this.activeSfx.add(audio);
    const cleanup = () => { this.activeSfx.delete(audio); };
    audio.addEventListener('ended', cleanup, { once: true });
    audio.addEventListener('error', cleanup, { once: true });
    void this.resume().then(() => audio.play()).catch(cleanup);
    return true;
  }

  public async resume(): Promise<void> {
    if (typeof window === 'undefined' || !window.AudioContext) return;
    this.audioContext ??= new window.AudioContext();
    if (this.audioContext.state === 'suspended') await this.audioContext.resume();
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.music) this.music.muted = muted;
    this.activeSfx.forEach((audio) => { audio.muted = muted; });
  }

  public isMuted(): boolean { return this.muted; }

  public stop(): void {
    this.music?.pause();
    if (this.music) this.music.currentTime = 0;
    this.activeSfx.forEach((audio) => { audio.pause(); audio.currentTime = 0; });
    this.activeSfx.clear();
  }
}

export const audioController = new AudioController();
