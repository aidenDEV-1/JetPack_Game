import { test, expect } from '@playwright/test';

test('로컬 플레이에서 생성된 아이템이 이동하고 코인을 반영한다', async ({ page }) => {
  test.skip(Boolean(process.env.E2E_BASE_URL), '실제 Entra 인증 staging에서 수행');
  await page.goto('/');
  await page.getByRole('button', { name: '개발용 mock 로그인' }).click();
  await expect(page.getByRole('button', { name: '5PM RUSH 시작' })).toBeVisible();
  await page.getByRole('button', { name: '5PM RUSH 시작' }).click();
  await page.waitForTimeout(3400);
  const before = await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getSnapshot?.());
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.spawnDemoItems?.());
  await page.waitForTimeout(5200);
  const after = await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getSnapshot?.());
  expect(before?.phase).toBe('running');
  expect(after?.distanceMeters ?? 0).toBeGreaterThan(before?.distanceMeters ?? 0);
  await expect(page.locator('.hud-coins')).toHaveText(/🟡 [1-9]\d*/);
});

