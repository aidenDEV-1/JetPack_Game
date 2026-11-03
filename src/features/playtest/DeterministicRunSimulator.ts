import { CHUNK_CATALOG } from '../chunks/chunkCatalog';
import { ChunkScheduler } from '../chunks/ChunkScheduler';
import { getWorldSpeed } from '../progression/DistanceProgression';

export interface SimulationResult {
  durationMs: number;
  distanceMeters: number;
  obstacleKinds: readonly string[];
  coinClusterCount: number;
  missileWarningCount: number;
  survived: boolean;
}

export function simulateRun(seed: number, durationMs = 30000): SimulationResult {
  const safeDurationMs = Math.max(0, Math.floor(durationMs));
  const scheduler = new ChunkScheduler();
  const random = createSeededRandom(seed);
  const obstacleKinds = new Set<string>();
  let coinClusterCount = 0;
  let missileWarningCount = 0;
  let distanceMeters = 0;
  for (let elapsedMs = 0; elapsedMs < safeDurationMs;) {
    const stepMs = Math.min(50, safeDurationMs - elapsedMs);
    distanceMeters += (getWorldSpeed(distanceMeters) * stepMs / 1000) / 10;
    while (scheduler.isDue(distanceMeters)) {
      const chunk = scheduler.next(distanceMeters, random);
      chunk.obstacles.forEach((obstacle) => {
        obstacleKinds.add(obstacle.patternId);
        if (obstacle.patternId === 'missile' && obstacle.warning) missileWarningCount += 1;
      });
      coinClusterCount += chunk.collectibles.filter((collectible) => collectible.kind === 'coin').length;
    }
    elapsedMs += stepMs;
  }
  return { durationMs: safeDurationMs, distanceMeters, obstacleKinds: [...obstacleKinds].sort(), coinClusterCount, missileWarningCount, survived: true };
}

function createSeededRandom(seed: number): () => number {
  let state = (Math.floor(seed) >>> 0) || 0x9e3779b9;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export const SIMULATION_CATALOG_SIZE = CHUNK_CATALOG.length;
