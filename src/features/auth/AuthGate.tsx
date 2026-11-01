import { useEffect, useState, type PropsWithChildren } from 'react';
import { authCopy } from './authCopy.ko';
import { isCompanyTenant } from '../../services/auth/azureStaticWebAppsAuth';
import type { AuthenticatedUser, AuthService } from '../../services/auth/types';

type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'authenticated'; user: AuthenticatedUser }
  | { status: 'denied' }
  | { status: 'error'; message: string };

interface AuthGateProps extends PropsWithChildren {
  authService: AuthService;
}

export function AuthGate({ authService, children }: AuthGateProps) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  const loadSession = async () => {
    setState({ status: 'loading' });
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        setState({ status: 'signed-out' });
        return;
      }
      setState(isCompanyTenant(user) ? { status: 'authenticated', user } : { status: 'denied' });
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : authCopy.configurationError });
    }
  };

  useEffect(() => {
    void loadSession();
  }, []);

  if (state.status === 'loading') return <AuthShell><p>{authCopy.loading}</p></AuthShell>;
  if (state.status === 'signed-out') {
    return <AuthShell><button className="primary-button" onClick={() => authService.login()}>{authCopy.login}</button><p>{authCopy.loginDescription}</p></AuthShell>;
  }
  if (state.status === 'denied') {
    return <AuthShell><p>{authCopy.accessDenied}</p><button className="secondary-button" onClick={() => authService.logout()}>{authCopy.logout}</button></AuthShell>;
  }
  if (state.status === 'error') {
    return <AuthShell><p>{state.message}</p><button className="secondary-button" onClick={() => void loadSession()}>{authCopy.retry}</button></AuthShell>;
  }

  return <>{children}</>;
}

function AuthShell({ children }: PropsWithChildren) {
  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="eyebrow">ENTRA ID EXCLUSIVE</p>
        <h1 id="auth-title">{authCopy.title}</h1>
        <p className="auth-subtitle">{authCopy.subtitle}</p>
        <div className="auth-content">{children}</div>
      </section>
    </main>
  );
}
