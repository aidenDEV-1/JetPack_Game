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
  return companyTenantId.length > 0 && user.tenantId.toLowerCase() === companyTenantId.toLowerCase();
}

export class AzureStaticWebAppsAuthService implements AuthService {
  public async getCurrentUser(): Promise<AuthenticatedUser | null> {
    const response = await fetch(AUTH_ME_URL, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`인증 세션 조회에 실패했습니다. (${response.status})`);

    const payload = (await response.json()) as StaticWebAppsMeResponse;
    return payload.clientPrincipal ? normalizePrincipal(payload.clientPrincipal) : null;
  }

  public login(): void {
    window.location.assign(LOGIN_URL);
  }

  public logout(): void {
    window.location.assign(LOGOUT_URL);
  }
}

export const azureStaticWebAppsAuth = new AzureStaticWebAppsAuthService();
