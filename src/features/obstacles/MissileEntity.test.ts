import { describe, expect, it } from 'vitest';
import { MissileEntity } from './MissileEntity';

describe('missile lifecycle', () => {
  it('transitions from right-edge warning to tracking and lock', () => {
    const missile = new MissileEntity();
    expect(missile.getPhase()).toBe('warning');
    missile.update(16, 1100, 300, 300, 1280, 300);
    expect(missile.getPhase()).toBe('warning');
    missile.update(16, 1040, 300, 360, 1280, 300);
    expect(['launched', 'tracking']).toContain(missile.getPhase());
    missile.update(2000, 300, 300, 360, 1280, 300);
    expect(missile.getPhase()).toBe('locked');
  });
});
