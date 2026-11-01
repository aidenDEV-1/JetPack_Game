import { useEffect, useRef } from 'react';
import { createPhaserGame, type GameBridge } from '../game/PhaserGame';
import { AuthGate } from '../features/auth/AuthGate';
import { azureStaticWebAppsAuth } from '../services/auth/azureStaticWebAppsAuth';

export function App() {
  return <AuthGate authService={azureStaticWebAppsAuth}><GameShell /></AuthGate>;
}

function GameShell() {
  const gameRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRootRef.current) return;

    const bridge: GameBridge = {
      onReady: () => undefined,
    };
    const game = createPhaserGame(gameRootRef.current, bridge);

    return () => game.destroy(true);
  }, []);

  return (
    <main className="app-shell">
      <section className="game-frame" aria-label="덱스 탈출 넘버원 5PM RUSH 게임 화면">
        <div ref={gameRootRef} className="game-root" />
        <div className="loading-chip">게임 준비 중</div>
      </section>
    </main>
  );
}
