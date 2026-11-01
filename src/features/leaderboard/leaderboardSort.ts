import type { LeaderboardEntry } from '../records/recordTypes';

export function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => b.distanceMeters - a.distanceMeters || a.achievedAt.localeCompare(b.achievedAt));
}
