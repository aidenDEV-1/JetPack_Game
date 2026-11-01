import type { HudViewModel } from './hudTypes';

interface GameHudProps extends HudViewModel {
  muted: boolean;
  onSettings: () => void;
}

export function GameHud({ distanceMeters, runCoins, tokenCount, hasShield, muted, onSettings }: GameHudProps) {
  return (
    <div className="game-hud" aria-label="게임 정보">
      <div className="hud-score-panel">
        <span className="hud-label">비행 거리</span>
        <strong className="hud-distance">{String(Math.floor(distanceMeters)).padStart(5, '0')}M</strong>
        <span className="hud-coins">🟡 {runCoins}</span>
      </div>
      <div className="hud-status-panel">
        <span className={hasShield ? 'hud-pill active' : 'hud-pill'}>방어막 {hasShield ? '보유' : '없음'}</span>
        <span className="hud-pill">DEX 토큰 {tokenCount}/3</span>
      </div>
      <button className="hud-settings-button" type="button" aria-label="설정 열기" onClick={onSettings}>
        {muted ? '🔇' : '⚙️'}
      </button>
    </div>
  );
}
