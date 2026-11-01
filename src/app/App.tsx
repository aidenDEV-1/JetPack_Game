import { lazy, Suspense } from 'react';
import { AuthGate } from '../features/auth/AuthGate';
import { azureStaticWebAppsAuth } from '../services/auth/azureStaticWebAppsAuth';

const GameShell = lazy(() => import('./GameShell').then(({ GameShell: LoadedGameShell }) => ({ default: LoadedGameShell })));

export function App() {
  return (
    <AuthGate authService={azureStaticWebAppsAuth}>
      <Suspense fallback={<main className="app-shell"><section className="game-frame loading-screen">게임 화면 준비 중…</section></main>}>
        <GameShell />
      </Suspense>
    </AuthGate>
  );
}
