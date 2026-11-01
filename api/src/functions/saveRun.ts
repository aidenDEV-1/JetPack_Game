import type { HttpRequest, HttpResponseInit } from '@azure/functions';
import type { SaveRunRequest, SaveRunResponse } from '../models/api-contracts';
import { createUpdatedRecord, type PlayerRecordRepository } from '../storage/playerRecordRepository';
import { getRequestUser } from '../auth/requestUser';

function isValidRun(value: unknown): value is SaveRunRequest {
  if (!value || typeof value !== 'object') return false;
  const run = value as Partial<SaveRunRequest>;
  return [run.distanceMeters, run.runCoins, run.score].every((item) => typeof item === 'number' && Number.isFinite(item) && item >= 0);
}

export function createSaveRunHandler(repository: PlayerRecordRepository) {
  return async (request: HttpRequest): Promise<HttpResponseInit> => {
    const user = getRequestUser(request);
    if (!user) return { status: 401, jsonBody: { message: '로그인이 필요합니다.' } };

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return { status: 400, jsonBody: { message: '요청 본문이 올바른 JSON이 아닙니다.' } };
    }
    if (!isValidRun(body)) return { status: 400, jsonBody: { message: '게임 결과 값이 올바르지 않습니다.' } };

    try {
      const existing = await repository.getByUserId(user.userId);
      const achievedAt = new Date().toISOString();
      const updated = createUpdatedRecord(existing, { ...user, ...body }, achievedAt);
      const record = await repository.upsert(updated.record);
      const response: SaveRunResponse = { record, isNewBest: updated.isNewBest };
      return { status: 200, jsonBody: response };
    } catch (error) {
      const correlationId = crypto.randomUUID();
      console.error(`[${correlationId}] run save failed`, error);
      return { status: 500, jsonBody: { message: '기록 저장에 실패했습니다.', correlationId } };
    }
  };
}
