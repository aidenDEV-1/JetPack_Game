import { describe, expect, it } from 'vitest';
import { PLAYER_COLLISION_BOUNDS, PLAYER_JETPACK_ANCHOR } from '../playerAssetConfig';
import { PlayerAnimationController } from '../playerAnimations';

describe('player animation states', () => {
  it('prevents a second crash and ends gray and fallen', () => {
    const controller = new PlayerAnimationController();
    expect(controller.beginCrash()).toBe(true);
    expect(controller.beginCrash()).toBe(false);
    controller.finishCrash();
    expect(controller.snapshot()).toEqual({ animation: 'fallen', boosting: false, gray: true });
  });

  it('uses independent boosting state', () => {
    const controller = new PlayerAnimationController();
    controller.setBoosting(true);
    expect(controller.snapshot().animation).toBe('boosting');
    expect(controller.snapshot().boosting).toBe(true);
  });

  it('does not leave the fallen state when a later animation is requested', () => {
    const controller = new PlayerAnimationController();
    controller.finishCrash();
    controller.setAnimation('running');
    expect(controller.snapshot().animation).toBe('fallen');
    expect(controller.snapshot().gray).toBe(true);
  });

  it('keeps the jetpack anchor separate from the character collision bounds', () => {
    expect(PLAYER_JETPACK_ANCHOR).toEqual({ x: -78, y: 18 });
    expect(PLAYER_COLLISION_BOUNDS).toEqual({ x: -42, y: -30, width: 84, height: 68 });
    expect(PLAYER_JETPACK_ANCHOR.x).toBeLessThan(PLAYER_COLLISION_BOUNDS.x);
  });
});
