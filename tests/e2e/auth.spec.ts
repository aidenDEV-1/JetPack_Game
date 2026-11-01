import { test, expect } from '@playwright/test';

test('비로그인 사용자는 로그인 게이트를 본다', async ({ page }) => {
  test.skip(Boolean(process.env.E2E_BASE_URL), '실제 Entra 인증 staging에서 수행');
  await page.goto('/');
  await expect(page.getByRole('button', { name: /회사 계정으로 로그인|개발용 mock 로그인/ })).toBeVisible();
  await expect(page.getByText('5PM RUSH')).toBeVisible();
});
