import { GAME_CONFIG } from '../../game/config/gameConfig';
import { OBSTACLE_TUNING } from '../../game/config/tuning/obstacles';
import type { ChunkObstacleSpec, GameChunk } from './chunkTypes';

export interface ChunkValidationError {
  chunkId: string;
  reason: string;
}

interface VerticalBlock {
  top: number;
  bottom: number;
  xMeters: number;
}

export function validateChunkReachability(chunk: GameChunk, minimumGapPx: number = OBSTACLE_TUNING.minimumPlayableGap): ChunkValidationError[] {
  const errors: ChunkValidationError[] = [];
  const playableHeight = GAME_CONFIG.floorY - GAME_CONFIG.ceilingY;
  const blocks = chunk.obstacles.map((obstacle) => toVerticalBlock(obstacle, playableHeight)).sort((left, right) => left.top - right.top);
  const obstacleColumns = groupByColumn(blocks);
  const narrowestOpening = obstacleColumns.reduce((narrowest, column) => Math.min(narrowest, largestOpening(column, playableHeight)), playableHeight);
  if (narrowestOpening < minimumGapPx) errors.push({ chunkId: chunk.id, reason: `maximum opening ${Math.round(narrowestOpening)}px is below ${minimumGapPx}px` });

  if (chunk.requiresShield && chunk.minDistanceMeters < OBSTACLE_TUNING.forcedPatternMinimumDistanceMeters) {
    errors.push({ chunkId: chunk.id, reason: `shield-required chunk starts before ${OBSTACLE_TUNING.forcedPatternMinimumDistanceMeters}m` });
  }
  chunk.obstacles.forEach((obstacle) => {
    if (obstacle.forced && !chunk.requiresShield) errors.push({ chunkId: chunk.id, reason: `${obstacle.patternId} is forced without shield prerequisite` });
    if (obstacle.yRatio < 0 || obstacle.yRatio > 1 || obstacle.heightRatio <= 0 || obstacle.heightRatio > 1) {
      errors.push({ chunkId: chunk.id, reason: `${obstacle.patternId} has invalid normalized vertical geometry` });
    }
  });
  chunk.collectibles.forEach((collectible) => {
    if (collectible.xMeters < 0 || collectible.yRatio < 0 || collectible.yRatio > 1) {
      errors.push({ chunkId: chunk.id, reason: `${collectible.kind} has an out-of-range position` });
    }
    const hit = blocks.some((block) => Math.abs(block.xMeters - collectible.xMeters) <= 18 && collectible.yRatio * playableHeight >= block.top && collectible.yRatio * playableHeight <= block.bottom);
    if (hit) errors.push({ chunkId: chunk.id, reason: `${collectible.kind} intersects an obstacle at ${collectible.xMeters}m` });
  });
  return errors;
}

function toVerticalBlock(obstacle: ChunkObstacleSpec, playableHeight: number): VerticalBlock {
  const center = obstacle.yRatio * playableHeight;
  const halfHeight = obstacle.heightRatio * playableHeight / 2;
  return { top: Math.max(0, center - halfHeight), bottom: Math.min(playableHeight, center + halfHeight), xMeters: obstacle.xMeters };
}

function groupByColumn(blocks: readonly VerticalBlock[]): VerticalBlock[][] {
  const columns: VerticalBlock[][] = [];
  blocks.forEach((block) => {
    const column = columns.find((candidate) => Math.abs(candidate[0].xMeters - block.xMeters) <= 18);
    if (column) column.push(block);
    else columns.push([block]);
  });
  return columns;
}

function largestOpening(blocks: readonly VerticalBlock[], playableHeight: number): number {
  const sorted = [...blocks].sort((left, right) => left.top - right.top);
  let largestGap = 0;
  let cursor = 0;
  sorted.forEach((block) => {
    largestGap = Math.max(largestGap, block.top - cursor);
    cursor = Math.max(cursor, block.bottom);
  });
  return Math.max(largestGap, playableHeight - cursor);
}
