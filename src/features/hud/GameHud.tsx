import type { HudViewModel } from './hudTypes';

interface GameHudProps extends HudViewModel {
  muted: boolean;
  onSettings: () => void;
}

export const BOOSTER_MAX_MS = 5000;

export function BoosterMeter({ active, remainingMs, maxMs }: { active: boolean; remainingMs: number; maxMs: number }) {
  const ratio = active ? Math.max(0, Math.min(1, remainingMs / maxMs)) : 0;
  const percent = Math.round(ratio * 100);
  return (
    <div className={active ? 'hud-booster-meter active' : 'hud-booster-meter'} aria-label={`부스터 ${percent}%`}>
      <div className="hud-meter-heading"><span className="hud-booster-label"><img src="/assets/ui/booster-icon.svg" alt="" />BOOSTER</span><strong>{active ? `${Math.ceil(Math.max(0, remainingMs) / 1000)}s` : '준비'}</strong></div>
      <div className="hud-meter-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <span className="hud-meter-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function GameHud({ distanceMeters, runCoins, tokenCount, hasShield, boosterActive, boosterRemainingMs, muted, paused, onSettings }: GameHudProps) {
  const safeTokenCount = Math.max(0, Math.min(3, Math.floor(tokenCount)));
  return (
    <div className="game-hud" aria-label="게임 정보" data-muted={muted}>
      <div className="hud-distance-readout" aria-live="polite">
        <span className="hud-label">비행 거리</span>
        <strong className="hud-distance">{String(Math.floor(distanceMeters)).padStart(5, '0')}M</strong>
        <span className="hud-coin-readout"><img src="/assets/ui/coin-icon.svg" alt="" /><strong className="hud-coins">{runCoins}</strong></span>
      </div>
      <div className="hud-right-rail">
        <div className="hud-status-row">
          <div className="hud-token-readout" aria-label={`DEX 토큰 ${safeTokenCount}/3`}>
            <img src="/assets/ui/dex-token-icon.svg" alt="" />
            <span><small>DEX 토큰</small><strong>{safeTokenCount}/3</strong></span>
            <span className="hud-token-segments" aria-hidden="true">{[0, 1, 2].map((segment) => <i key={segment} className={segment < safeTokenCount ? 'filled' : ''} />)}</span>
          </div>
          <div className={hasShield ? 'hud-shield-readout active' : 'hud-shield-readout'} aria-label={hasShield ? '방어막 보유' : '방어막 없음'}>
            <img src="/assets/ui/shield-icon.svg" alt="" />
            <span><small>방어막</small><strong>{hasShield ? 'READY' : '없음'}</strong></span>
          </div>
          <BoosterMeter active={boosterActive} remainingMs={boosterRemainingMs} maxMs={BOOSTER_MAX_MS} />
          {paused ? <span className="hud-paused-badge">PAUSED</span> : null}
          <button className="hud-settings-button" type="button" aria-label="설정 열기" onClick={onSettings} title="설정 열기">⚙</button>
        </div>
      </div>
    </div>
  );
}
