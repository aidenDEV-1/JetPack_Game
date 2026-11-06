import type { GameChunk } from './chunkTypes';

export const CHUNK_CATALOG: readonly GameChunk[] = [
  {
    id: 'A', minDistanceMeters: 0, maxDistanceMeters: 1000, weight: 1,
    obstacles: [{ patternId: 'vertical-laser', xMeters: 70, yRatio: 0.5, heightRatio: 0.12, warning: false }],
    collectibles: [
      { kind: 'coin', xMeters: 18, yRatio: 0.58, pattern: 'arc' },
      { kind: 'coin', xMeters: 42, yRatio: 0.48, pattern: 'line' },
      { kind: 'coin', xMeters: 66, yRatio: 0.36, pattern: 'zigzag' },
      { kind: 'coin', xMeters: 94, yRatio: 0.62, pattern: 'arc' },
    ],
  },
  {
    id: 'B', minDistanceMeters: 500, maxDistanceMeters: 2000, weight: 1,
    obstacles: [
      { patternId: 'horizontal-laser', xMeters: 84, yRatio: 0.32, heightRatio: 0.12, warning: true },
      { patternId: 'missile', xMeters: 112, yRatio: 0.62, heightRatio: 0.14, warning: true },
      { patternId: 'electro-drone', xMeters: 52, yRatio: 0.78, heightRatio: 0.12, warning: true },
    ],
    collectibles: [
      { kind: 'coin', xMeters: 14, yRatio: 0.26, pattern: 'line' },
      { kind: 'coin', xMeters: 38, yRatio: 0.34, pattern: 'arc' },
      { kind: 'coin', xMeters: 62, yRatio: 0.44, pattern: 'zigzag' },
      { kind: 'token', xMeters: 108, yRatio: 0.7, pattern: 'zigzag' },
    ],
  },
  {
    id: 'C', minDistanceMeters: 1000, maxDistanceMeters: 3000, weight: 1,
    obstacles: [
      { patternId: 'monster', xMeters: 58, yRatio: 0.22, heightRatio: 0.12, warning: false },
      { patternId: 'electro-drone', xMeters: 58, yRatio: 0.78, heightRatio: 0.12, warning: true },
    ],
    collectibles: [
      { kind: 'coin', xMeters: 20, yRatio: 0.2, pattern: 'line' },
      { kind: 'coin', xMeters: 42, yRatio: 0.36, pattern: 'arc' },
      { kind: 'coin', xMeters: 78, yRatio: 0.52, pattern: 'arc' },
      { kind: 'coin', xMeters: 102, yRatio: 0.74, pattern: 'line' },
    ],
  },
  {
    id: 'D', minDistanceMeters: 1800, maxDistanceMeters: 4000, weight: 1,
    obstacles: [
      { patternId: 'vertical-laser', xMeters: 72, yRatio: 0.2, heightRatio: 0.1, warning: true },
      { patternId: 'vertical-laser', xMeters: 72, yRatio: 0.8, heightRatio: 0.1, warning: false },
    ],
    collectibles: [
      { kind: 'coin', xMeters: 18, yRatio: 0.28, pattern: 'arc' },
      { kind: 'coin', xMeters: 42, yRatio: 0.48, pattern: 'zigzag' },
      { kind: 'coin', xMeters: 92, yRatio: 0.74, pattern: 'line' },
      { kind: 'token', xMeters: 116, yRatio: 0.48, pattern: 'orbit' },
    ],
  },
  {
    id: 'E', minDistanceMeters: 2500, maxDistanceMeters: 5000, weight: 1,
    obstacles: [{ patternId: 'missile', xMeters: 90, yRatio: 0.62, heightRatio: 0.14, warning: true }],
    collectibles: [
      { kind: 'coin', xMeters: 22, yRatio: 0.58, pattern: 'line' },
      { kind: 'coin', xMeters: 46, yRatio: 0.42, pattern: 'arc' },
      { kind: 'coin', xMeters: 70, yRatio: 0.28, pattern: 'zigzag' },
      { kind: 'coin', xMeters: 112, yRatio: 0.2, pattern: 'line' },
    ],
  },
] as const;
