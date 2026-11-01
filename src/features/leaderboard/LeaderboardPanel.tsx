import type { LeaderboardResponse } from '../records/recordTypes';

export function LeaderboardPanel({ leaderboard, onClose }: { leaderboard: LeaderboardResponse; onClose?: () => void }) {
  return (
    <section className="leaderboard-panel" aria-labelledby="leaderboard-title">
      <div className="leaderboard-heading"><div><p className="eyebrow">ORGANIZATION RANKING</p><h2 id="leaderboard-title">최고 탈출 기록 TOP 10</h2></div>{onClose ? <button type="button" className="icon-button" aria-label="랭킹 닫기" onClick={onClose}>×</button> : null}</div>
      <ol className="leaderboard-list">
        {leaderboard.top10.map((entry) => <li key={`${entry.rank}-${entry.displayName}`}><span>#{entry.rank}</span><strong>{entry.displayName}</strong><span>{Math.floor(entry.distanceMeters)}M</span><span>🟡 {entry.coins}</span></li>)}
      </ol>
      {leaderboard.currentUser && !leaderboard.top10.some((entry) => entry.rank === leaderboard.currentUser?.rank) ? <div className="leaderboard-current"><span>내 순위 #{leaderboard.currentUser.rank}</span><strong>{leaderboard.currentUser.displayName}</strong><span>{Math.floor(leaderboard.currentUser.distanceMeters)}M</span></div> : null}
    </section>
  );
}
