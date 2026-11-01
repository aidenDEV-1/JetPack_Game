import { describe, expect, it } from 'vitest';
import { sortLeaderboard } from '../leaderboardSort';

describe('leaderboard sorting', () => {
  it('sorts distance descending and earlier ties first', () => {
    const entries = [
      { rank: 1, displayName: '늦게', distanceMeters: 100, coins: 1, achievedAt: '2026-11-01T18:00:00.000Z' },
      { rank: 2, displayName: '먼저', distanceMeters: 100, coins: 1, achievedAt: '2026-11-01T17:00:00.000Z' },
      { rank: 3, displayName: '짧게', distanceMeters: 90, coins: 2, achievedAt: '2026-11-01T16:00:00.000Z' },
    ];
    expect(sortLeaderboard(entries).map((entry) => entry.displayName)).toEqual(['먼저', '늦게', '짧게']);
  });
});
