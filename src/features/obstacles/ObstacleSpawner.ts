import { obstaclePatterns, isReachablePattern } from './obstaclePatterns';
import type { ObstaclePattern, PlayableGap } from './obstacleTypes';

export class ObstacleSpawner {
  public choosePattern(random: () => number = Math.random): ObstaclePattern | null {
    return obstaclePatterns[Math.min(obstaclePatterns.length - 1, Math.floor(random() * obstaclePatterns.length))] ?? null;
  }

  public validateReachability(gaps: PlayableGap[]): boolean { return isReachablePattern(gaps); }
}
