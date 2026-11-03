import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GameHud } from './GameHud';

const renderHud = (overrides: Partial<Parameters<typeof GameHud>[0]> = {}) => renderToStaticMarkup(
  <GameHud
    distanceMeters={34}
    runCoins={7}
    tokenCount={2}
    hasShield={false}
    boosterActive
    boosterRemainingMs={2500}
    boosterPhase="boosting"
    boosterGraceRemainingMs={0}
    paused={false}
    muted={false}
    onSettings={() => undefined}
    {...overrides}
  />,
);

describe('arcade HUD', () => {
  it('formats distance, coin, token, and shield readouts without emoji UI', () => {
    const markup = renderHud();
    expect(markup).toContain('00034M');
    expect(markup).toContain('>7<');
    expect(markup).toContain('2/3');
    expect(markup).toContain('방어막 없음');
    expect(markup).not.toContain('🟡');
  });

  it('exposes a bounded booster progress meter and settings control', () => {
    const markup = renderHud({ hasShield: true, muted: true, paused: true });
    expect(markup).toContain('aria-valuenow="50"');
    expect(markup).toContain('width:50%');
    expect(markup).toContain('방어막 보유');
    expect(markup).toContain('설정 열기');
    expect(markup).toContain('PAUSED');
    expect(markup).toContain('data-muted="true"');
  });
});
