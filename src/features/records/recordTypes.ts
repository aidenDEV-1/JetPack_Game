export interface GameRunResult {
  distanceMeters: number;
  runCoins: number;
  score: number;
}

export interface SavedRecord {
  bestDistanceMeters: number;
  bestRunCoins: number;
  bestScore: number;
  totalCoins: number;
}

export interface SaveRunResponse {
  record: SavedRecord;
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

export type SaveState =
  | { status: 'idle' }
  | { status: 'saving'; result: GameRunResult }
  | { status: 'pending'; result: GameRunResult; message: string; response?: SaveRunResponse }
  | { status: 'saved'; result: GameRunResult; response: SaveRunResponse; leaderboard: LeaderboardResponse }
  | { status: 'error'; result: GameRunResult; message: string };
