import { test, expect } from '@playwright/test';

test('인증 staging 기록 저장과 랭킹 smoke test placeholder', async () => {
  test.skip(!process.env.E2E_BASE_URL, 'E2E_BASE_URL과 인증 세션이 필요');
  expect(process.env.E2E_BASE_URL).toBeTruthy();
});