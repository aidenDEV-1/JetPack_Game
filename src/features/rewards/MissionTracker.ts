import { createMissionSet } from './missionCatalog';
import type { MissionEvent, MissionSnapshot, RunMission } from './missionTypes';

export type { MissionEvent } from './missionTypes';

export class MissionTracker {
  private missions: RunMission[] = [];
  private bonusCoins = 0;

  public constructor(private readonly random: () => number = Math.random) {}

  public startRun(): void {
    this.missions = createMissionSet(this.random);
    this.bonusCoins = 0;
  }

  public recordEvent(event: MissionEvent): void {
    this.missions.forEach((mission) => {
      const nextProgress = getNextProgress(mission, event);
      if (nextProgress <= mission.progress) return;
      mission.progress = Math.min(mission.target, nextProgress);
      if (!mission.completed && mission.progress >= mission.target) {
        mission.completed = true;
        this.bonusCoins += mission.bonusCoins;
      }
    });
  }

  public snapshot(): MissionSnapshot {
    return {
      missions: this.missions.map((mission) => ({ ...mission })),
      bonusCoins: this.bonusCoins,
    };
  }

  public reset(): void {
    this.missions = [];
    this.bonusCoins = 0;
  }
}

function getNextProgress(mission: RunMission, event: MissionEvent): number {
  if (mission.id === 'collect-coins' && event.type === 'coin-collected') return mission.progress + event.amount;
  if (mission.id === 'evade-missiles' && event.type === 'missile-evaded') return mission.progress + 1;
  if (mission.id === 'activate-booster' && event.type === 'booster-activated') return mission.progress + 1;
  if (mission.id === 'reach-distance' && event.type === 'distance-reached') return Math.max(mission.progress, event.meters);
  return mission.progress;
}
