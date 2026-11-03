import { REWARD_TUNING } from '../../game/config/tuning/rewards';
import type { MissionId, RunMission } from './missionTypes';

interface MissionDefinition {
  id: MissionId;
  label: string;
  target: number;
}

export const MISSION_CATALOG: readonly MissionDefinition[] = [
  { id: 'collect-coins', label: '코인 수집가', target: REWARD_TUNING.coinMissionTarget },
  { id: 'evade-missiles', label: '미사일 회피', target: REWARD_TUNING.missileMissionTarget },
  { id: 'activate-booster', label: '부스터 점화', target: REWARD_TUNING.boosterMissionTarget },
  { id: 'reach-distance', label: '퇴근 거리 돌파', target: REWARD_TUNING.distanceMissionTarget },
];

export function createMissionSet(random: () => number = Math.random): RunMission[] {
  const shuffled = [...MISSION_CATALOG];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.max(0, Math.min(0.999999, random())) * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, REWARD_TUNING.missionsPerRun).map((definition) => ({
    ...definition,
    bonusCoins: REWARD_TUNING.missionBonusCoins,
    progress: 0,
    completed: false,
  }));
}
