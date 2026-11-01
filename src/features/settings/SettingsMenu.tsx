interface SettingsMenuProps {
  open: boolean;
  paused: boolean;
  muted: boolean;
  countdown: number | null;
  onClose: () => void;
  onPause: () => void;
  onResume: () => void;
  onToggleMute: () => void;
  onExit: () => void;
}

export function SettingsMenu({ open, paused, muted, countdown, onClose, onPause, onResume, onToggleMute, onExit }: SettingsMenuProps) {
  if (!open) return null;
  return (
    <div className="settings-backdrop" role="presentation">
      <section className="settings-menu" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="settings-heading">
          <h2 id="settings-title">설정</h2>
          <button type="button" className="icon-button" aria-label="설정 닫기" onClick={onClose}>×</button>
        </div>
        {countdown ? <div className="resume-countdown" aria-live="assertive">{countdown}</div> : null}
        <button type="button" className="settings-action" onClick={paused ? onResume : onPause}>{paused ? '다시 진행' : '일시정지'}</button>
        <button type="button" className="settings-action" onClick={onToggleMute}>{muted ? '소리 켜기' : '음소거'}</button>
        <button type="button" className="settings-action danger" onClick={onExit}>게임 나가기</button>
      </section>
    </div>
  );
}
