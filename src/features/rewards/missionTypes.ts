export type MissionId = 'collect-coins' | 'evade-missiles' | 'activate-booster' | 'reach-distance';

export interface RunMission {
  id: MissionId;
  label: string;
  target: number;
  bonusCoins: number;
  progress: number;
  completed: boolean;
}

export interface MissionSnapshot {
  missions: readonly RunMission[];
  bonusCoins: number;
}

export type MissionEvent =
  | { type: 'coin-collected'; amount: number }
  | { type: 'missile-evaded' }
  | { type: 'booster-activated' }
  | { type: 'distance-reached'; meters: number };
