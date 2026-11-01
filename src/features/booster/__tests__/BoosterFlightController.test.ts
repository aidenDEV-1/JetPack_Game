import { describe, expect, it } from 'vitest';
import { GAME_CONFIG } from '../../../game/config/gameConfig';
import { BoosterFlightController } from '../BoosterFlightController';

describe('BoosterFlightController', () => {
  it('travels right, holds, then returns to the player anchor', () => {
    const controller = new BoosterFlightController();
    controller.activate();
    const outbound = controller.update(1000);
    expect(outbound.active).toBe(true);
    expect(outbound.playerX).toBeGreaterThan(GAME_CONFIG.playerX);
    expect(outbound.worldSpeedMultiplier).toBe(2.4);
    expect(controller.update(1000).phase).toBe('holding');
    expect(controller.update(3500)).toMatchObject({ active: false, phase: 'idle', playerX: GAME_CONFIG.playerX, remainingMs: 0 });
  });

  it('restarting an active booster resets the flight instead of stacking time', () => {
    const controller = new BoosterFlightController();
    controller.activate();
    controller.update(3000);
    controller.activate();
    expect(controller.snapshot()).toMatchObject({ active: true, phase: 'travelling-out', playerX: GAME_CONFIG.playerX, remainingMs: 5000 });
  });
});
