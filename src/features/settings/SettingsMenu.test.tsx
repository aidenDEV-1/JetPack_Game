import { describe, expect, it } from 'vitest';
import { AudioController } from '../../services/audio/AudioController';

describe('settings audio controls', () => {
  it('toggles mute for music and effects together', () => {
    const audio = new AudioController();
    expect(audio.isMuted()).toBe(false);
    expect(audio.toggleMute()).toBe(true);
    expect(audio.isMuted()).toBe(true);
    expect(audio.toggleMute()).toBe(false);
  });
});
