import { describe, expect, it } from 'vitest';
import { createUpdatedRecord, sortRecords, type PlayerRecordRepository } from '../../storage/playerRecordRepository';
import type { PlayerRecordDocument } from '../../models/player-record';

const baseRecord: PlayerRecordDocument = {
  id: 'user-1', userId: 'user-1', displayName: '테스터', tenantId: 'tenant-1',
  bestDistanceMeters: 100, bestRunCoins: 4, bestScore: 10,
  bestAchievedAt: '2026-11-01T17:00:00.000Z', totalCoins: 8, updatedAt: '2026-11-01T17:00:00.000Z',
};

describe('score record rules', () => {
  it('always accumulates run coins but only replaces a farther best', () => {
    const result = createUpdatedRecord(baseRecord, { userId: 'user-1', displayName: '테스터', tenantId: 'tenant-1', distanceMeters: 90, runCoins: 3, score: 9 }, '2026-11-01T18:00:00.000Z');
    expect(result.isNewBest).toBe(false);
    expect(result.record.totalCoins).toBe(11);
    expect(result.record.bestDistanceMeters).toBe(100);
  });

  it('sorts by distance descending then earlier achievement time', () => {
    const records = [
      { ...baseRecord, id: 'later', userId: 'later', bestDistanceMeters: 200, bestAchievedAt: '2026-11-01T19:00:00.000Z' },
      { ...baseRecord, id: 'first', userId: 'first', bestDistanceMeters: 200, bestAchievedAt: '2026-11-01T18:00:00.000Z' },
      baseRecord,
    ];
    expect(sortRecords(records).map((record) => record.userId)).toEqual(['first', 'later', 'user-1']);
  });

  it('keeps repository contract independent from Cosmos implementation', async () => {
    const repository: PlayerRecordRepository = {
      getByUserId: async () => baseRecord,
      upsert: async (record) => record,
      listAll: async () => [baseRecord],
    };
    await expect(repository.getByUserId('user-1')).resolves.toEqual(baseRecord);
  });
});
