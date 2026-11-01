export type BackgroundSceneKey =
  | 'office'
  | 'security'
  | 'city'
  | 'subway-entrance'
  | 'subway-inside'
  | 'subway-exit'
  | 'rooftop';

export interface BackgroundSegment {
  index: number;
  startMeters: number;
  name: string;
  sceneKey: BackgroundSceneKey;
}

export const backgroundSegments: readonly BackgroundSegment[] = [
  { index: 0, startMeters: 0, name: '사무실·복도', sceneKey: 'office' },
  { index: 1, startMeters: 1000, name: '보안 게이트·주차장', sceneKey: 'security' },
  { index: 2, startMeters: 2000, name: '도심 고층빌딩', sceneKey: 'city' },
  { index: 3, startMeters: 3000, name: '지하철역·지하철·지상 탈출', sceneKey: 'subway-entrance' },
  { index: 4, startMeters: 4000, name: '야간 하늘·옥상', sceneKey: 'rooftop' },
];

export function resolveBackgroundScene(distanceMeters: number): BackgroundSceneKey {
  const safeDistance = Number.isFinite(distanceMeters) ? Math.max(0, distanceMeters) : 0;
  if (safeDistance < 1000) return 'office';
  if (safeDistance < 2000) return 'security';
  if (safeDistance < 3000) return 'city';
  if (safeDistance >= 4000) return 'rooftop';
  const subwayProgress = (safeDistance - 3000) / 1000;
  if (subwayProgress < 1 / 3) return 'subway-entrance';
  if (subwayProgress < 2 / 3) return 'subway-inside';
  return 'subway-exit';
}

export function resolveBackgroundSegmentIndex(distanceMeters: number): number {
  const safeDistance = Number.isFinite(distanceMeters) ? Math.max(0, distanceMeters) : 0;
  return Math.min(4, Math.floor(safeDistance / 1000));
}

