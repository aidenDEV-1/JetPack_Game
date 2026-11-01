import type {
  AuthenticatedUser,
  AuthService,
  StaticWebAppsClaim,
  StaticWebAppsMeResponse,
  StaticWebAppsPrincipal,
} from './types';

const AUTH_ME_URL = '/.auth/me';
const LOGIN_URL = '/.auth/login/aad?post_login_redirect_uri=/';
const LOGOUT_URL = '/.auth/logout?post_logout_redirect_uri=/';
const DEV_MOCK_USER: AuthenticatedUser = {
  userId: 'local-dev-user',
  displayName: '로컬 테스트 사용자',
  email: 'local-dev@example.invalid',
  tenantId: 'local-dev-tenant',
};

let devMockSignedIn = false;

export function isDevMockAuthEnabled(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_MOCK_AUTH === 'true';
}

function claimValue(claims: StaticWebAppsClaim[] | undefined, names: string[]): string | null {
  const claim = claims?.find((item) => {
    const name = item.typ ?? item.name;
    return name ? names.includes(name.toLowerCase()) : false;
  });
  return claim?.val ?? claim?.value ?? null;
}

export function normalizePrincipal(principal: StaticWebAppsPrincipal): AuthenticatedUser | null {
  if (!principal.userId || !principal.userDetails) return null;

  const tenantId = claimValue(principal.claims, ['tid', 'tenantid', 'tenant_id']);
  if (!tenantId) return null;

  return {
    userId: principal.userId,
    displayName: principal.userDetails,
    email: principal.userDetails.includes('@') ? principal.userDetails : null,
    tenantId,
  };
}

export function isCompanyTenant(user: AuthenticatedUser, companyTenantId = import.meta.env.VITE_COMPANY_TENANT_ID ?? ''): boolean {
  if (isDevMockAuthEnabled() && user.userId === DEV_MOCK_USER.userId) return true;
  return companyTenantId.length > 0 && user.tenantId.toLowerCase() === companyTenantId.toLowerCase();
}

export class AzureStaticWebAppsAuthService implements AuthService {
  public async getCurrentUser(): Promise<AuthenticatedUser | null> {
    if (isDevMockAuthEnabled()) return devMockSignedIn ? DEV_MOCK_USER : null;
    const response = await fetch(AUTH_ME_URL, { headers: { Accept: 'application/json' } });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`인증 세션 조회에 실패했습니다. (${response.status})`);

    let payload: StaticWebAppsMeResponse;
    try {
      payload = (await response.json()) as StaticWebAppsMeResponse;
    } catch {
      // Vite local development has no /.auth/me endpoint; treat it as signed out.
      return null;
    }
    return payload.clientPrincipal ? normalizePrincipal(payload.clientPrincipal) : null;
  }

  public login(): void {
    if (isDevMockAuthEnabled()) {
      devMockSignedIn = true;
      return;
    }
    window.location.assign(LOGIN_URL);
  }

  public logout(): void {
    if (isDevMockAuthEnabled()) {
      devMockSignedIn = false;
      window.location.reload();
      return;
    }
    window.location.assign(LOGOUT_URL);
  }
}

export const azureStaticWebAppsAuth = new AzureStaticWebAppsAuthService();
