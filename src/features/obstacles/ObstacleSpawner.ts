import { obstaclePatterns, isReachablePattern } from './obstaclePatterns';
import type { ObstaclePattern, PlayableGap, SpawnContext } from './obstacleTypes';

export class ObstacleSpawner {
  private forcedPatternUsedBySegment = new Set<number>();

  public choosePattern(context: SpawnContext, random: () => number = Math.random): ObstaclePattern | null {
    const segment = Math.floor(context.distanceMeters / 1000);
    const forcedEligible = context.hasShieldPickupAhead && !context.forcedPatternUsedInSegment && !this.forcedPatternUsedBySegment.has(segment);
    if (forcedEligible && random() >= 0.85) {
      this.forcedPatternUsedBySegment.add(segment);
      return obstaclePatterns.find((pattern) => pattern.requiresShield)!;
    }
    const regular = obstaclePatterns.filter((pattern) => !pattern.requiresShield);
    return regular[Math.min(regular.length - 1, Math.floor(random() * regular.length))];
  }

  public canUseForcedPattern(context: SpawnContext): boolean {
    const segment = Math.floor(context.distanceMeters / 1000);
    return context.hasShieldPickupAhead && !context.forcedPatternUsedInSegment && !this.forcedPatternUsedBySegment.has(segment);
  }

  public validateReachability(gaps: PlayableGap[]): boolean { return isReachablePattern(gaps); }
}
