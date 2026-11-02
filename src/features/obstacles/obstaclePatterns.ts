import type { ObstaclePattern, PlayableGap } from './obstacleTypes';

export const obstaclePatterns: ObstaclePattern[] = [
  { id: 'vertical-laser', kind: 'vertical-laser', requiresShield: false, warningArrow: false, width: 42, height: 500, displayWidth: 68, displayHeight: 500, accentColor: 0xff4d5a, warningColor: 0xffff6b },
  { id: 'horizontal-laser', kind: 'horizontal-laser', requiresShield: false, warningArrow: false, width: 360, height: 34, displayWidth: 420, displayHeight: 48, accentColor: 0xff3f4fff, warningColor: 0xffff6b },
  { id: 'missile', kind: 'missile', requiresShield: false, warningArrow: true, width: 90, height: 34, displayWidth: 128, displayHeight: 48, accentColor: 0xffff5a5f, warningColor: 0xffffc857 },
  { id: 'monster', kind: 'monster', requiresShield: false, warningArrow: false, width: 72, height: 72, displayWidth: 112, displayHeight: 112, accentColor: 0xffd43f8f, warningColor: 0xffff5a5f },
  { id: 'forced-crossfire', kind: 'horizontal-laser', requiresShield: true, warningArrow: false, width: 360, height: 580, displayWidth: 420, displayHeight: 600, accentColor: 0xffff3d43, warningColor: 0xffffc857 },
];

export function isReachablePattern(gaps: PlayableGap[], minimumGap = 90): boolean {
  return gaps.some((gap) => gap.endY - gap.startY >= minimumGap);
}
