import type { GameRunResult, LeaderboardResponse, SaveRunResponse } from '../../features/records/recordTypes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.ok) throw new Error(`서버 요청에 실패했습니다. (${response.status})`);
  return response.json() as Promise<T>;
}

export function saveGameRun(result: GameRunResult): Promise<SaveRunResponse> {
  const payload = { distanceMeters: result.distanceMeters, runCoins: result.totalRunCoins, score: result.score };
  return requestJson<SaveRunResponse>(`${API_BASE_URL}/runs`, { method: 'POST', body: JSON.stringify(payload) });
}

export function getLeaderboard(): Promise<LeaderboardResponse> {
  return requestJson<LeaderboardResponse>(`${API_BASE_URL}/leaderboard`);
}
