import type { HttpRequest } from '@azure/functions';

export interface RequestUser {
  userId: string;
  displayName: string;
  tenantId: string;
}

interface ClientPrincipal {
  userId?: string;
  userDetails?: string;
  claims?: Array<{ typ?: string; val?: string }>;
}

export function getRequestUser(request: HttpRequest): RequestUser | null {
  const encoded = request.headers.get('x-ms-client-principal');
  if (!encoded) return null;
  try {
    const principal = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')) as ClientPrincipal;
    const tenantClaim = principal.claims?.find((claim) => claim.typ?.toLowerCase() === 'tid');
    if (!principal.userId || !principal.userDetails || !tenantClaim?.val) return null;
    return { userId: principal.userId, displayName: principal.userDetails, tenantId: tenantClaim.val };
  } catch {
    return null;
  }
}
