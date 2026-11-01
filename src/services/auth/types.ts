export interface AuthenticatedUser {
  userId: string;
  displayName: string;
  email: string | null;
  tenantId: string;
}

export interface AuthService {
  getCurrentUser(): Promise<AuthenticatedUser | null>;
  login(): void;
  logout(): void;
}

export interface StaticWebAppsClaim {
  typ?: string;
  val?: string;
  name?: string;
  value?: string;
}

export interface StaticWebAppsPrincipal {
  userId?: string;
  userDetails?: string;
  identityProvider?: string;
  claims?: StaticWebAppsClaim[];
}

export interface StaticWebAppsMeResponse {
  clientPrincipal?: StaticWebAppsPrincipal | null;
}
