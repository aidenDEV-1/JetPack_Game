import { describe, expect, it } from 'vitest';
import { GameState } from './GameState';

describe('GameState', () => {
  it('tracks collectibles and booster fields only during a run', () => {
    const state = new GameState(300);
    state.collectCoin(4);
    expect(state.snapshot().runCoins).toBe(0);
    state.start();
    state.collectCoin(4);
    state.collectToken();
    state.setShield(true);
    state.setBooster(true, 5000);
    expect(state.snapshot()).toMatchObject({ runCoins: 4, tokenCount: 1, hasShield: true, boosterActive: true, boosterRemainingMs: 5000 });
  });

  it('counts only explicit crash-slide distance after the run enters crashed phase', () => {
    const state = new GameState(300);
    state.start();
    state.crash();
    state.addDistance(10);
    state.addCrashDistance(12.5);
    expect(state.snapshot().distanceMeters).toBe(12.5);
  });

  it('resets all run counters without changing base speed', () => {
    const state = new GameState(300);
    state.start();
    state.collectCoin(2);
    state.setBooster(true, 1000);
    state.reset();
    expect(state.snapshot()).toEqual({ phase: 'ready', distanceMeters: 0, runCoins: 0, tokenCount: 0, speed: 300, hasShield: false, boosterActive: false, boosterRemainingMs: 0, boosterPhase: 'idle', boosterGraceRemainingMs: 0, missions: { missions: [], bonusCoins: 0 } });
  });
});
