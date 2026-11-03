export type ChunkId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type ChunkCollectibleKind = 'coin' | 'token' | 'shield';
export type ChunkCollectiblePattern = 'line' | 'arc' | 'zigzag' | 'orbit';

export interface GameChunk {
  id: ChunkId;
  minDistanceMeters: number;
  maxDistanceMeters: number | null;
  weight: number;
  obstacles: readonly ChunkObstacleSpec[];
  collectibles: readonly ChunkCollectibleSpec[];
  requiresShield: boolean;
}

export interface ChunkObstacleSpec {
  patternId: string;
  xMeters: number;
  yRatio: number;
  heightRatio: number;
  warning: boolean;
  forced: boolean;
}

export interface ChunkCollectibleSpec {
  kind: ChunkCollectibleKind;
  xMeters: number;
  yRatio: number;
  pattern: ChunkCollectiblePattern;
}
