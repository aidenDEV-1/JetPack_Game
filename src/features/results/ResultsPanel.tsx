import { getResultMessage } from './resultMessages';
import type { RunMission } from '../rewards/missionTypes';

export interface ResultViewModel {
  distanceMeters: number;
  runCoins: number;
  missionBonusCoins: number;
  totalRunCoins: number;
  missions: readonly RunMission[];
  totalCoins: number;
  bestDistanceMeters: number;
  isNewBest: boolean;
  isRankOne: boolean;
  savePending: boolean;
  leaderboardAvailable: boolean;
}

interface ResultsPanelProps extends ResultViewModel {
  onRetry: () => void;
  onReplay: () => void;
  onLeaderboard: () => void;
}

export function ResultsPanel({ distanceMeters, runCoins, missionBonusCoins, totalRunCoins, missions, totalCoins, bestDistanceMeters, isNewBest, isRankOne, savePending, leaderboardAvailable, onRetry, onReplay, onLeaderboard }: ResultsPanelProps) {
  return (
    <section className="results-panel" aria-labelledby="results-title">
      <p className="eyebrow">RUN COMPLETE</p>
      <h2 id="results-title">{getResultMessage(isNewBest, isRankOne)}</h2>
      <div className="results-grid">
        <span>비행 거리<strong>{Math.floor(distanceMeters)}M</strong></span>
        <span>이번 코인<strong>{runCoins}</strong></span>
        <span>미션 보너스<strong>+{missionBonusCoins}</strong></span>
        <span>이번 보상<strong>{totalRunCoins}</strong></span>
        <span>누적 코인<strong>{totalCoins}</strong></span>
        <span>최고 기록<strong>{Math.floor(bestDistanceMeters)}M</strong></span>
      </div>
      <section className="mission-summary" aria-label="런 미션 결과">
        <div className="mission-summary-heading"><strong>RUN MISSIONS</strong><span>보너스 +{missionBonusCoins} 코인</span></div>
        <div className="mission-list">
          {missions.map((mission) => {
            const percent = Math.round(Math.min(1, mission.progress / Math.max(1, mission.target)) * 100);
            const displayedProgress = Math.floor(mission.progress);
            return <article className={mission.completed ? 'mission-card completed' : 'mission-card'} key={mission.id} aria-label={`${mission.label} ${displayedProgress}/${mission.target}`}>
              <div className="mission-card-heading"><span>{mission.completed ? '✓' : '○'} {mission.label}</span><strong>{displayedProgress}/{mission.target}</strong></div>
              <div className="mission-progress"><span style={{ width: `${percent}%` }} /></div>
              <small>{mission.completed ? `완료 · +${mission.bonusCoins} 코인` : `완료 시 +${mission.bonusCoins} 코인`}</small>
            </article>;
          })}
        </div>
      </section>
      {savePending ? <div className="save-pending">저장 대기 중 <button type="button" onClick={onRetry}>저장 재시도</button></div> : null}
      <div className="results-actions"><button type="button" onClick={onReplay}>다시 도전</button><button type="button" onClick={onLeaderboard} disabled={!leaderboardAvailable}>랭킹 보기</button></div>
    </section>
  );
}
