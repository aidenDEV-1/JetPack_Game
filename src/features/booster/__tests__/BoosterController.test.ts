import { describe, expect, it } from 'vitest';
import { BoosterController } from '../BoosterController';

describe('booster controller', () => {
  it('starts with the configured short intro boost', () => {
    const controller = new BoosterController();
    controller.startInitial();
    expect(controller.snapshot().phase).toBe('intro');
    expect(controller.isInvincible()).toBe(true);
    controller.tick(1499);
    expect(controller.isInvincible()).toBe(true);
    controller.tick(1);
    expect(controller.isInvincible()).toBe(true);
    expect(controller.snapshot().phase).toBe('grace');
    controller.tick(1000);
    expect(controller.isInvincible()).toBe(false);
    expect(controller.snapshot().phase).toBe('complete');
  });

  it('consumes three tokens and resets token count', () => {
    const controller = new BoosterController();
    controller.collectToken();
    controller.collectToken();
    expect(controller.snapshot().tokenCount).toBe(2);
    controller.collectToken();
    expect(controller.snapshot().tokenCount).toBe(0);
    expect(controller.isActive()).toBe(true);
  });

  it('does not stack shields', () => {
    const controller = new BoosterController();
    expect(controller.collectShield()).toBe(true);
    expect(controller.collectShield()).toBe(false);
    expect(controller.consumeShield()).toBe(true);
    expect(controller.consumeShield()).toBe(false);
  });
});
