import { describe, expect, it } from 'vitest';
import { MissionTracker } from '../MissionTracker';

describe('MissionTracker', () => {
  it('selects exactly three deterministic missions and pays each completion once', () => {
    const tracker = new MissionTracker(() => 0.999);
    tracker.startRun();
    const initial = tracker.snapshot();
    expect(initial.missions).toHaveLength(3);
    expect(initial.missions.map((mission) => mission.id)).toEqual(['collect-coins', 'evade-missiles', 'activate-booster']);

    tracker.recordEvent({ type: 'coin-collected', amount: 50 });
    tracker.recordEvent({ type: 'coin-collected', amount: 50 });
    tracker.recordEvent({ type: 'missile-evaded' });
    tracker.recordEvent({ type: 'missile-evaded' });
    tracker.recordEvent({ type: 'missile-evaded' });
    tracker.recordEvent({ type: 'booster-activated' });
    tracker.recordEvent({ type: 'booster-activated' });
    const completed = tracker.snapshot();

    expect(completed.missions.every((mission) => mission.completed)).toBe(true);
    expect(completed.missions.every((mission) => mission.progress === mission.target)).toBe(true);
    expect(completed.bonusCoins).toBe(75);
  });

  it('resets progress and selection at the start of the next run', () => {
    const tracker = new MissionTracker(() => 0.999);
    tracker.startRun();
    tracker.recordEvent({ type: 'coin-collected', amount: 50 });
    expect(tracker.snapshot().bonusCoins).toBe(25);
    tracker.startRun();
    expect(tracker.snapshot().bonusCoins).toBe(0);
    expect(tracker.snapshot().missions.every((mission) => mission.progress === 0 && !mission.completed)).toBe(true);
  });
});
