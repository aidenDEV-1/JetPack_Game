export type CollisionOutcome = 'ignored-by-booster' | 'blocked-by-shield' | 'crash';

export function resolveObstacleCollision(input: { invincible: boolean; hasShield: boolean }): CollisionOutcome {
  if (input.invincible) return 'ignored-by-booster';
  if (input.hasShield) return 'blocked-by-shield';
  return 'crash';
}
