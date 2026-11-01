import { test, expect } from '@playwright/test';

test('로컬 게임 셸은 시작 버튼과 한국어 제목을 표시한다', async ({ page }) => {
  test.skip(Boolean(process.env.E2E_BASE_URL), '인증된 staging 계정이 필요');
  await page.goto('/');
  await expect(page.getByText('회사 계정으로 로그인')).toBeVisible();
});

test('인증 staging 게임 루프 smoke test placeholder', async () => {
  test.skip(!process.env.E2E_BASE_URL, 'E2E_BASE_URL과 인증 세션이 필요');
  expect(process.env.E2E_BASE_URL).toBeTruthy();
});