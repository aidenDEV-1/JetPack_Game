import { describe, expect, it } from 'vitest';
import { isCompanyTenant, normalizePrincipal } from '../../services/auth/azureStaticWebAppsAuth';

describe('Entra Static Web Apps identity', () => {
  it('normalizes display name and tenant claim', () => {
    expect(normalizePrincipal({ userId: 'u1', userDetails: '김우재', claims: [{ typ: 'tid', val: 'tenant-1' }] })).toEqual({
      userId: 'u1',
      displayName: '김우재',
      email: null,
      tenantId: 'tenant-1',
    });
  });

  it('requires the configured company tenant', () => {
    const user = { userId: 'u1', displayName: '김우재', email: null, tenantId: 'company-1' };
    expect(isCompanyTenant(user, 'company-1')).toBe(true);
    expect(isCompanyTenant(user, 'other-tenant')).toBe(false);
    expect(isCompanyTenant(user, '')).toBe(false);
  });
});
