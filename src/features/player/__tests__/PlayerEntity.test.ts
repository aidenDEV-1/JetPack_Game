import { describe, expect, it } from 'vitest';
import { PLAYER_COLLISION_BOUNDS, PLAYER_JETPACK_ANCHOR } from '../playerAssetConfig';
import { PlayerAnimationController } from '../playerAnimations';

describe('player animation states', () => {
  it('prevents a second crash and ends gray and dead', () => {
    const controller = new PlayerAnimationController();
    expect(controller.beginCrash()).toBe(true);
    expect(controller.beginCrash()).toBe(false);
    controller.finishCrash();
    expect(controller.snapshot()).toEqual({ animation: 'dead', boosting: false, gray: true });
  });

  it('uses independent boosting state', () => {
    const controller = new PlayerAnimationController();
    controller.setBoosting(true);
    expect(controller.snapshot().animation).toBe('running');
    expect(controller.snapshot().boosting).toBe(true);
  });

  it('does not leave the dead state when a later animation is requested', () => {
    const controller = new PlayerAnimationController();
    controller.finishCrash();
    controller.setAnimation('running');
    expect(controller.snapshot().animation).toBe('dead');
    expect(controller.snapshot().gray).toBe(true);
  });

  it('transitions through explicit takeoff, flight, fall, and landing states', () => {
    const controller = new PlayerAnimationController();
    expect(controller.updateMotion({ grounded: true, thrusting: true, boosterActive: false, deltaMs: 16 })).toBe('takeoff');
    expect(controller.updateMotion({ grounded: false, thrusting: true, boosterActive: false, deltaMs: 120 })).toBe('flying');
    expect(controller.updateMotion({ grounded: false, thrusting: false, boosterActive: false, deltaMs: 16 })).toBe('falling');
    expect(controller.updateMotion({ grounded: true, thrusting: false, boosterActive: false, deltaMs: 16 })).toBe('landing');
    expect(controller.updateMotion({ grounded: true, thrusting: false, boosterActive: false, deltaMs: 120 })).toBe('running');
  });

  it('keeps boosting independent from the body animation state', () => {
    const controller = new PlayerAnimationController();
    controller.setBoosting(true);
    expect(controller.snapshot()).toMatchObject({ animation: 'running', boosting: true });
  });

  it('keeps the jetpack anchor separate from the character collision bounds', () => {
    expect(PLAYER_JETPACK_ANCHOR).toEqual({ x: -78, y: 18 });
    expect(PLAYER_COLLISION_BOUNDS).toEqual({ x: -40, y: -32, width: 79, height: 65 });
    expect(PLAYER_JETPACK_ANCHOR.x).toBeLessThan(PLAYER_COLLISION_BOUNDS.x);
  });
});
