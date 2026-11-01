import type { PlayerRecordDocument } from './player-record';

export interface SaveRunRequest {
  distanceMeters: number;
  runCoins: number;
  score: number;
}

export interface SaveRunResponse {
  record: PlayerRecordDocument;
  isNewBest: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  distanceMeters: number;
  coins: number;
  achievedAt: string;
}

export interface LeaderboardResponse {
  top10: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
}
