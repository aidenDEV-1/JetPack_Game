export type ChunkId = 'A' | 'B' | 'C' | 'D' | 'E';
export type ChunkCollectibleKind = 'coin' | 'token' | 'shield';
export type ChunkCollectiblePattern = 'line' | 'arc' | 'zigzag' | 'orbit';

export interface GameChunk {
  id: ChunkId;
  minDistanceMeters: number;
  maxDistanceMeters: number | null;
  weight: number;
  obstacles: readonly ChunkObstacleSpec[];
  collectibles: readonly ChunkCollectibleSpec[];
}

export interface ChunkObstacleSpec {
  patternId: string;
  xMeters: number;
  yRatio: number;
  heightRatio: number;
  warning: boolean;
}

export interface ChunkCollectibleSpec {
  kind: ChunkCollectibleKind;
  xMeters: number;
  yRatio: number;
  pattern: ChunkCollectiblePattern;
}
