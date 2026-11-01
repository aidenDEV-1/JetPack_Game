import { getResultMessage } from './resultMessages';

export interface ResultViewModel {
  distanceMeters: number;
  runCoins: number;
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

export function ResultsPanel({ distanceMeters, runCoins, totalCoins, bestDistanceMeters, isNewBest, isRankOne, savePending, leaderboardAvailable, onRetry, onReplay, onLeaderboard }: ResultsPanelProps) {
  return (
    <section className="results-panel" aria-labelledby="results-title">
      <p className="eyebrow">RUN COMPLETE</p>
      <h2 id="results-title">{getResultMessage(isNewBest, isRankOne)}</h2>
      <div className="results-grid">
        <span>비행 거리<strong>{Math.floor(distanceMeters)}M</strong></span>
        <span>이번 코인<strong>{runCoins}</strong></span>
        <span>누적 코인<strong>{totalCoins}</strong></span>
        <span>최고 기록<strong>{Math.floor(bestDistanceMeters)}M</strong></span>
      </div>
      {savePending ? <div className="save-pending">저장 대기 중 <button type="button" onClick={onRetry}>저장 재시도</button></div> : null}
      <div className="results-actions"><button type="button" onClick={onReplay}>다시 도전</button><button type="button" onClick={onLeaderboard} disabled={!leaderboardAvailable}>랭킹 보기</button></div>
    </section>
  );
}
