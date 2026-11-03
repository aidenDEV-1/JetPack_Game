import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ResultsPanel } from './ResultsPanel';

const renderResults = (savePending = false) => renderToStaticMarkup(
  <ResultsPanel
    distanceMeters={120}
    runCoins={4}
    missionBonusCoins={25}
    totalRunCoins={29}
    missions={[
      { id: 'collect-coins', label: '코인 수집가', target: 50, bonusCoins: 25, progress: 50, completed: true },
      { id: 'evade-missiles', label: '미사일 회피', target: 3, bonusCoins: 25, progress: 1, completed: false },
      { id: 'activate-booster', label: '부스터 점화', target: 2, bonusCoins: 25, progress: 2, completed: true },
    ]}
    totalCoins={29}
    bestDistanceMeters={120}
    isNewBest
    isRankOne={false}
    savePending={savePending}
    leaderboardAvailable
    onRetry={() => undefined}
    onReplay={() => undefined}
    onLeaderboard={() => undefined}
  />,
);

describe('results mission summary', () => {
  it('renders all three missions and separates bonus from run coins', () => {
    const markup = renderResults();
    expect(markup.match(/class="mission-card(?: |")/g)).toHaveLength(3);
    expect(markup).toContain('미션 보너스<strong>+25</strong>');
    expect(markup).toContain('이번 보상<strong>29</strong>');
    expect(markup).toContain('완료 · +25 코인');
  });

  it('keeps mission summary visible while saving is pending', () => {
    const markup = renderResults(true);
    expect(markup).toContain('저장 대기 중');
    expect(markup).toContain('RUN MISSIONS');
  });
});
