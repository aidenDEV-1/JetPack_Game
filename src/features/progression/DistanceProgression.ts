import { PROGRESSION_CONFIG } from './progressionConfig';

export interface ProgressionSnapshot {
  distanceMeters: number;
  speedMultiplier: number;
  segmentIndex: number;
}

export function getProgression(distanceMeters: number): ProgressionSnapshot {
  const safeDistance = Math.max(0, distanceMeters);
  const segmentIndex = Math.floor(safeDistance / PROGRESSION_CONFIG.segmentLengthMeters);
  const speedSegment = Math.min(segmentIndex, PROGRESSION_CONFIG.maxSpeedSegment);
  return {
    distanceMeters: safeDistance,
    speedMultiplier: PROGRESSION_CONFIG.speedIncreasePerSegment ** speedSegment,
    segmentIndex: Math.min(segmentIndex, 4),
  };
}

export function getWorldSpeed(distanceMeters: number): number {
  return PROGRESSION_CONFIG.baseSpeed * getProgression(distanceMeters).speedMultiplier;
}
