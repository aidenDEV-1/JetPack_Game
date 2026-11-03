import { gameCopy } from '../../content/copy.ko';

interface ClockOverlayProps {
  visible: boolean;
  value: '4:59:59' | '5:00:00';
}

export function ClockOverlay({ visible, value }: ClockOverlayProps) {
  if (!visible) return null;
  return <div className={`clock-overlay${value === gameCopy.clockAfter ? ' alarm' : ''}`} aria-live="assertive"><div className="wall-clock">{value}</div><p>{value === gameCopy.clockAfter ? '5시 정각! 출발!' : '퇴근 준비…'}</p></div>;
}

export function StartOverlay({ onStart }: { onStart: () => void }) {
  return <div className="start-overlay"><p className="eyebrow">DEX ESCAPE NUMBER ONE</p><h1>{gameCopy.title}</h1><p>{gameCopy.subtitle}</p><button className="start-button" type="button" onClick={onStart}>{gameCopy.start}</button></div>;
}
