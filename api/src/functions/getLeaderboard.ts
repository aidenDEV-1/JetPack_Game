import type { HttpRequest, HttpResponseInit } from '@azure/functions';
import type { LeaderboardEntry, LeaderboardResponse } from '../models/api-contracts';
import { sortRecords, type PlayerRecordRepository } from '../storage/playerRecordRepository';
import { getRequestUser } from '../auth/requestUser';

export function createLeaderboardHandler(repository: PlayerRecordRepository) {
  return async (request: HttpRequest): Promise<HttpResponseInit> => {
    const user = getRequestUser(request);
    if (!user) return { status: 401, jsonBody: { message: '로그인이 필요합니다.' } };

    try {
      const sorted = sortRecords(await repository.listAll());
      const entries: LeaderboardEntry[] = sorted.map((record, index) => ({
        rank: index + 1,
        displayName: record.displayName,
        distanceMeters: record.bestDistanceMeters,
        coins: record.bestRunCoins,
        achievedAt: record.bestAchievedAt,
      }));
      const currentUserIndex = sorted.findIndex((record) => record.userId === user.userId);
      const response: LeaderboardResponse = {
        top10: entries.slice(0, 10),
        currentUser: currentUserIndex >= 0 ? entries[currentUserIndex] : null,
      };
      return { status: 200, jsonBody: response };
    } catch (error) {
      const correlationId = crypto.randomUUID();
      console.error(`[${correlationId}] leaderboard read failed`, error);
      return { status: 500, jsonBody: { message: '랭킹 조회에 실패했습니다.', correlationId } };
    }
  };
}
