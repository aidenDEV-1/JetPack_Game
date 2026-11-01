import { test, expect } from '@playwright/test';

test('로컬 플레이에서 시작 부스터와 재발동 비행이 실제 x축으로 이동한다', async ({ page }) => {
  test.skip(Boolean(process.env.E2E_BASE_URL), '실제 Entra 인증 staging에서 수행');
  await page.goto('/');
  await page.getByRole('button', { name: '개발용 mock 로그인' }).click();
  await page.getByRole('button', { name: '5PM RUSH 시작' }).click();
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getSnapshot?.().phase), { timeout: 8_000 }).toBe('running');
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getBoosterSnapshot?.().active), { timeout: 2_000 }).toBe(true);
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getBoosterSnapshot?.().playerX ?? 0), { timeout: 2_000 }).toBeGreaterThan(220);
  const outbound = await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getBoosterSnapshot?.());
  expect(outbound?.active).toBe(true);
  expect(outbound?.playerX ?? 0).toBeGreaterThan(220);
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.deactivateBooster?.());
  const returned = await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getBoosterSnapshot?.());
  expect(returned).toMatchObject({ active: false, playerX: 220 });
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.activateBooster?.());
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getBoosterSnapshot?.().active)).toBe(true);
});

