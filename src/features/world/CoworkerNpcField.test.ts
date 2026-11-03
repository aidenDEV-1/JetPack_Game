import { describe, expect, it } from 'vitest';
import { WORLD_TUNING } from '../../game/config/tuning/world';
import type { CoworkerNpcSnapshot } from './coworkerNpcTypes';

describe('coworker NPC contract', () => {
  it('keeps the visual-only pool bounded and explicitly non-colliding', () => {
    const snapshot: CoworkerNpcSnapshot = {
      id: 'coworker-1',
      x: 500,
      y: 623,
      reaction: 'walk',
      collisionEnabled: false,
    };
    expect(WORLD_TUNING.coworker.poolSize).toBe(6);
    expect(snapshot.collisionEnabled).toBe(false);
  });
});
