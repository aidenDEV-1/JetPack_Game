import { PROGRESSION_CONFIG } from './progressionConfig';

export interface ProgressionSnapshot {
  distanceMeters: number;
  speedMultiplier: number;
  segmentIndex: number;
}

export function getProgression(distanceMeters: number): ProgressionSnapshot {
  const safeDistance = Number.isFinite(distanceMeters) ? Math.max(0, distanceMeters) : 0;
  const segmentIndex = Math.floor(safeDistance / PROGRESSION_CONFIG.segmentLengthMeters);
  const speedProgress = Math.min(safeDistance / PROGRESSION_CONFIG.segmentLengthMeters, PROGRESSION_CONFIG.maxSpeedSegment);
  return {
    distanceMeters: safeDistance,
    speedMultiplier: PROGRESSION_CONFIG.speedIncreasePerSegment ** speedProgress,
    segmentIndex: Math.min(segmentIndex, 4),
  };
}

export function getWorldSpeed(distanceMeters: number): number {
  return PROGRESSION_CONFIG.baseSpeed * getProgression(distanceMeters).speedMultiplier;
}
