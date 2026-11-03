import { OBSTACLE_TUNING } from '../../game/config/tuning/obstacles';
import { CHUNK_CATALOG } from './chunkCatalog';
import type { GameChunk } from './chunkTypes';

export interface ChunkSchedulerSnapshot {
  activeChunkId: string | null;
  nextDistanceMeters: number;
}

export class ChunkScheduler {
  private activeChunkId: string | null = null;
  private nextDistanceMeters = 0;

  public isDue(distanceMeters: number): boolean {
    return distanceMeters >= this.nextDistanceMeters;
  }

  public next(distanceMeters: number, random: () => number = Math.random): GameChunk {
    if (!this.isDue(distanceMeters)) throw new Error('ChunkScheduler.next called before the next distance threshold');
    const candidates = CHUNK_CATALOG.filter((chunk) => (
      chunk.minDistanceMeters <= distanceMeters
      && (chunk.maxDistanceMeters === null || distanceMeters < chunk.maxDistanceMeters)
    ));
    const pool = candidates.length > 0 ? candidates : CHUNK_CATALOG;
    const latestDistanceBand = Math.max(...pool.map((chunk) => chunk.minDistanceMeters));
    const bandPool = pool.filter((chunk) => chunk.minDistanceMeters === latestDistanceBand);
    const chunk = weightedPick(bandPool, random);
    this.activeChunkId = chunk.id;
    this.nextDistanceMeters += OBSTACLE_TUNING.chunkCadenceMeters;
    return chunk;
  }

  public snapshot(): ChunkSchedulerSnapshot {
    return { activeChunkId: this.activeChunkId, nextDistanceMeters: this.nextDistanceMeters };
  }

  public reset(): void {
    this.activeChunkId = null;
    this.nextDistanceMeters = 0;
  }
}

function weightedPick(chunks: readonly GameChunk[], random: () => number): GameChunk {
  const totalWeight = chunks.reduce((sum, chunk) => sum + Math.max(0, chunk.weight), 0);
  if (totalWeight <= 0) return chunks[0];
  let cursor = Math.max(0, Math.min(0.999999, random())) * totalWeight;
  for (const chunk of chunks) {
    cursor -= Math.max(0, chunk.weight);
    if (cursor < 0) return chunk;
  }
  return chunks[chunks.length - 1];
}
