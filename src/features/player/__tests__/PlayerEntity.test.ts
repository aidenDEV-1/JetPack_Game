import { describe, expect, it } from 'vitest';
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
});
