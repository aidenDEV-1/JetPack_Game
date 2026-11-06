import { describe, expect, it } from 'vitest';
import { GAME_CONFIG } from '../../../game/config/gameConfig';
import { CHUNK_CATALOG } from '../chunkCatalog';
import { validateChunkReachability } from '../chunkReachability';
import type { GameChunk } from '../chunkTypes';

describe('game chunk reachability', () => {
  it('validates every authored A-F chunk against the player-height gap', () => {
    CHUNK_CATALOG.forEach((chunk) => expect(validateChunkReachability(chunk)).toEqual([]));
  });

  it('rejects an opening smaller than 1.6 player heights', () => {
    const blocked: GameChunk = {
      id: 'A', minDistanceMeters: 0, maxDistanceMeters: 1000, weight: 1,
      obstacles: [
        { patternId: 'top', xMeters: 10, yRatio: 0.2, heightRatio: 0.4, warning: false },
        { patternId: 'bottom', xMeters: 10, yRatio: 0.8, heightRatio: 0.4, warning: false },
      ],
      collectibles: [],
    };
    expect(validateChunkReachability(blocked, GAME_CONFIG.obstacleScale.minPlayableGap)).toEqual([
      expect.objectContaining({ chunkId: 'A', reason: expect.stringContaining('maximum opening') }),
    ]);
  });

  it('keeps the catalog free of shield-required forced chunks', () => {
    expect(CHUNK_CATALOG.map((chunk) => chunk.id)).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(CHUNK_CATALOG.flatMap((chunk) => chunk.obstacles).some((obstacle) => obstacle.patternId === 'forced-crossfire')).toBe(false);
  });

  it('places a warning missile in every normal distance chunk', () => {
    CHUNK_CATALOG.forEach((chunk) => {
      expect(chunk.obstacles.some((obstacle) => obstacle.patternId === 'missile' && obstacle.warning)).toBe(true);
    });
  });
});
