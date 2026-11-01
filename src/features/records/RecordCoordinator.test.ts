import { describe, expect, it, vi } from 'vitest';
import { RecordCoordinator } from './RecordCoordinator';

describe('record coordinator', () => {
  it('saves once then fetches leaderboard', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ record: { bestDistanceMeters: 120, bestRunCoins: 4, bestScore: 10, totalCoins: 4 }, isNewBest: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ top10: [], currentUser: null }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const coordinator = new RecordCoordinator();
    const state = await coordinator.save({ distanceMeters: 120, runCoins: 4, score: 10 });
    expect(state.status).toBe('saved');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.unstubAllGlobals();
  });

  it('keeps failed results in memory for retry without local storage', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);
    const coordinator = new RecordCoordinator();
    expect((await coordinator.save({ distanceMeters: 1, runCoins: 1, score: 1 })).status).toBe('pending');
    expect((await coordinator.retry()).status).toBe('pending');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.unstubAllGlobals();
  });
});
