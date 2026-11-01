import { test, expect } from '@playwright/test';

test('로컬 플레이에서 장애물 충돌이 crash 상태를 만든다', async ({ page }) => {
  test.skip(Boolean(process.env.E2E_BASE_URL), '실제 Entra 인증 staging에서 수행');
  await page.goto('/');
  await page.getByRole('button', { name: '개발용 mock 로그인' }).click();
  await page.getByRole('button', { name: '5PM RUSH 시작' }).click();
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getSnapshot?.().phase), { timeout: 8_000 }).toBe('running');
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getBoosterSnapshot?.().active), { timeout: 2_000 }).toBe(true);
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.deactivateBooster?.());
  await expect.poll(async () => page.evaluate(() => typeof window.__5PM_RUSH_TEST_API__?.spawnDemoObstacle)).toBe('function');
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.spawnDemoObstacle?.());
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getSnapshot?.().phase), { timeout: 5000 }).toBe('crashed');
});

