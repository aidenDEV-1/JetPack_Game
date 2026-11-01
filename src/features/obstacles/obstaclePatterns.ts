import type { ObstaclePattern, PlayableGap } from './obstacleTypes';

export const obstaclePatterns: ObstaclePattern[] = [
  { id: 'vertical-laser', kind: 'vertical-laser', requiresShield: false, warningArrow: false, width: 42, height: 500 },
  { id: 'horizontal-laser', kind: 'horizontal-laser', requiresShield: false, warningArrow: false, width: 360, height: 34 },
  { id: 'missile', kind: 'missile', requiresShield: false, warningArrow: true, width: 90, height: 34 },
  { id: 'monster', kind: 'monster', requiresShield: false, warningArrow: false, width: 72, height: 72 },
  { id: 'forced-crossfire', kind: 'horizontal-laser', requiresShield: true, warningArrow: false, width: 360, height: 580 },
];

export function isReachablePattern(gaps: PlayableGap[], minimumGap = 90): boolean {
  return gaps.some((gap) => gap.endY - gap.startY >= minimumGap);
}
