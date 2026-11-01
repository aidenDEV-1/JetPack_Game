import type { PlayerRecordDocument } from '../models/player-record';

export interface PlayerRecordRepository {
  getByUserId(userId: string): Promise<PlayerRecordDocument | null>;
  upsert(record: PlayerRecordDocument): Promise<PlayerRecordDocument>;
  listAll(): Promise<PlayerRecordDocument[]>;
}

export function createUpdatedRecord(
  existing: PlayerRecordDocument | null,
  input: Pick<PlayerRecordDocument, 'userId' | 'displayName' | 'tenantId'> & { distanceMeters: number; runCoins: number; score: number },
  achievedAt: string,
): { record: PlayerRecordDocument; isNewBest: boolean } {
  const now = new Date().toISOString();
  const isNewBest = existing === null || input.distanceMeters > existing.bestDistanceMeters;
  const record: PlayerRecordDocument = {
    id: input.userId,
    userId: input.userId,
    displayName: input.displayName,
    tenantId: input.tenantId,
    bestDistanceMeters: isNewBest ? input.distanceMeters : existing.bestDistanceMeters,
    bestRunCoins: isNewBest ? input.runCoins : existing.bestRunCoins,
    bestScore: isNewBest ? input.score : existing.bestScore,
    bestAchievedAt: isNewBest ? achievedAt : existing.bestAchievedAt,
    totalCoins: (existing?.totalCoins ?? 0) + input.runCoins,
    updatedAt: now,
  };
  return { record, isNewBest };
}

export function sortRecords(records: PlayerRecordDocument[]): PlayerRecordDocument[] {
  return [...records].sort((a, b) => {
    const distanceDifference = b.bestDistanceMeters - a.bestDistanceMeters;
    return distanceDifference !== 0
      ? distanceDifference
      : a.bestAchievedAt.localeCompare(b.bestAchievedAt);
  });
}
