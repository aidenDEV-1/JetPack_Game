import { OBSTACLE_TUNING } from '../../game/config/tuning/obstacles';

export type MissilePhase = 'warning' | 'launched' | 'tracking' | 'locked' | 'offscreen';

export class MissileEntity {
  private phase: MissilePhase = 'warning';

  public update(
    deltaMs: number,
    x: number,
    y: number,
    targetY: number,
    viewportWidth: number,
    worldSpeed: number,
  ): { extraX: number; nextY: number } {
    if (this.phase === 'warning' && x <= viewportWidth - OBSTACLE_TUNING.missileWarningDistancePx) this.phase = 'launched';
    if (this.phase === 'launched' && x <= OBSTACLE_TUNING.missileLockDistancePx) this.phase = 'tracking';
    if (this.phase === 'tracking') {
      const trackingSpeed = worldSpeed * OBSTACLE_TUNING.missileSpeedMultiplier * 0.45;
      const nextY = moveTowards(y, targetY, trackingSpeed * Math.max(0, deltaMs) / 1000);
      if (Math.abs(targetY - nextY) <= 4) this.phase = 'locked';
      return { extraX: -worldSpeed * (OBSTACLE_TUNING.missileSpeedMultiplier - 1) * Math.max(0, deltaMs) / 1000, nextY };
    }
    if (this.phase === 'launched' || this.phase === 'locked') {
      return { extraX: -worldSpeed * (OBSTACLE_TUNING.missileSpeedMultiplier - 1) * Math.max(0, deltaMs) / 1000, nextY: y };
    }
    if (x < -160) this.phase = 'offscreen';
    return { extraX: 0, nextY: y };
  }

  public getPhase(): MissilePhase { return this.phase; }
}

function moveTowards(value: number, target: number, amount: number): number {
  if (Math.abs(target - value) <= amount) return target;
  return value + Math.sign(target - value) * amount;
}
