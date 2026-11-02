import { describe, expect, it } from 'vitest';
import { ObstacleSpawner } from './ObstacleSpawner';
import { obstaclePatterns, isReachablePattern } from './obstaclePatterns';
import { obstacleVisualCatalog } from './obstacleVisualCatalog';

describe('obstacle patterns', () => {
  it('keeps visible footprints larger than collision footprints with contrast colors', () => {
    obstaclePatterns.forEach((pattern) => {
      expect(pattern.displayWidth).toBeGreaterThanOrEqual(pattern.width);
      expect(pattern.displayHeight).toBeGreaterThanOrEqual(pattern.height);
      expect(pattern.accentColor).not.toBe(0);
      expect(pattern.warningColor).not.toBe(0);
      expect(obstacleVisualCatalog[pattern.visualId]).toBeDefined();
      expect(pattern.motion.periodMs).toBeGreaterThan(0);
    });
  });

  it('only exposes the forced pattern after a shield pickup and once per segment', () => {
    const spawner = new ObstacleSpawner();
    expect(spawner.canUseForcedPattern({ distanceMeters: 1000, speed: 300, hasShieldPickupAhead: false, forcedPatternUsedInSegment: false })).toBe(false);
    expect(spawner.canUseForcedPattern({ distanceMeters: 1100, speed: 300, hasShieldPickupAhead: true, forcedPatternUsedInSegment: false })).toBe(true);
    const forced = spawner.choosePattern({ distanceMeters: 1100, speed: 300, hasShieldPickupAhead: true, forcedPatternUsedInSegment: false }, () => 0.99);
    expect(forced?.requiresShield).toBe(true);
    expect(spawner.canUseForcedPattern({ distanceMeters: 1000, speed: 300, hasShieldPickupAhead: true, forcedPatternUsedInSegment: false })).toBe(false);
  });

  it('never emits an unshielded forced pattern over a 10000m simulation', () => {
    const spawner = new ObstacleSpawner();
    for (let distance = 0; distance <= 10000; distance += 100) {
      const pattern = spawner.choosePattern({ distanceMeters: distance, speed: 300, hasShieldPickupAhead: distance >= 400, forcedPatternUsedInSegment: false }, () => 0.99);
      if (pattern?.requiresShield) expect(distance).toBeGreaterThanOrEqual(1100);
    }
  });

  it('requires a playable vertical gap for ordinary patterns', () => {
    expect(isReachablePattern([{ startY: 100, endY: 180 }])).toBe(false);
    expect(isReachablePattern([{ startY: 250, endY: 400 }])).toBe(true);
    expect(obstaclePatterns.filter((pattern) => pattern.warningArrow).map((pattern) => pattern.id)).toEqual([
      'vertical-laser-full',
      'horizontal-laser-full',
      'missile',
      'electro-drone',
      'rotor',
    ]);
  });

  it('defines full, fixed, or random spans for every laser pattern', () => {
    obstaclePatterns.filter((pattern) => pattern.kind.includes('laser')).forEach((pattern) => {
      expect(pattern.laserSpan).toBeDefined();
      expect(pattern.laserVisual?.glowWidth).toBeGreaterThan(pattern.laserVisual?.beamWidth ?? 0);
      expect(pattern.laserVisual?.beamWidth).toBeGreaterThanOrEqual(pattern.laserVisual?.coreWidth ?? 0);
      expect(pattern.laserVisual?.beamWidth).toBeLessThanOrEqual(16);
      expect(pattern.laserVisual?.coreWidth).toBeLessThanOrEqual(4);
      expect(pattern.laserVisual?.glowWidth).toBeLessThanOrEqual(32);
      expect(pattern.laserVisual?.chargeDurationMs).toBeGreaterThan(0);
    });
  });

  it('uses the security visual catalog instead of a purple monster fallback', () => {
    expect(obstaclePatterns.find((pattern) => pattern.id === 'monster')).toMatchObject({ visualId: 'security-drone', motion: { type: 'hover' } });
    expect(obstaclePatterns.find((pattern) => pattern.id === 'electro-drone')).toMatchObject({ visualId: 'electro-drone', motion: { type: 'sway' } });
    expect(obstaclePatterns.find((pattern) => pattern.id === 'rotor')).toMatchObject({ visualId: 'rotor', motion: { type: 'spin' } });
  });
});
