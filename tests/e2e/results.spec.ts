import { test, expect, type Page } from '@playwright/test';

test('충돌 애니메이션 후 새 기록 결과를 한 번 저장한다', async ({ page }, testInfo) => {
  test.skip(Boolean(process.env.E2E_BASE_URL), '실제 Entra 인증 staging에서 수행');
  let saveCalls = 0;
  await page.route('**/api/runs', async (route) => {
    saveCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ record: { bestDistanceMeters: 140, bestRunCoins: 2, bestScore: 160, totalCoins: 2 }, isNewBest: true }),
    });
  });
  await page.route('**/api/leaderboard', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ top10: [], currentUser: { rank: 2, displayName: '테스터', distanceMeters: 140, coins: 2, achievedAt: '2026-11-01T00:00:00.000Z' } }),
    });
  });
  await startAndCrash(page);

  await expect(page.getByRole('heading', { name: '멋쟁이네~' })).toBeVisible({ timeout: 5000 });
  await expect.poll(() => saveCalls).toBe(1);
  await expect(page.locator('.results-panel .results-grid span').first()).toBeVisible();
  await expect(page.locator('.mission-card')).toHaveCount(3);
  await expect(page.getByText('RUN MISSIONS')).toBeVisible();
  await expect(page.getByText(/미션 보너스/)).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('mission-result.png') });
});

test('기록 저장 실패 후 같은 결과를 재시도할 수 있다', async ({ page }) => {
  test.skip(Boolean(process.env.E2E_BASE_URL), '실제 Entra 인증 staging에서 수행');
  let saveCalls = 0;
  await page.route('**/api/runs', async (route) => {
    saveCalls += 1;
    if (saveCalls === 1) {
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'offline' }) });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ record: { bestDistanceMeters: 140, bestRunCoins: 2, bestScore: 160, totalCoins: 2 }, isNewBest: false }),
    });
  });
  await page.route('**/api/leaderboard', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ top10: [], currentUser: { rank: 2, displayName: '테스터', distanceMeters: 100, coins: 1, achievedAt: '2026-11-01T00:00:00.000Z' } }),
    });
  });
  await startAndCrash(page);

  await expect(page.getByText('저장 대기 중')).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: '저장 재시도' }).click();
  await expect.poll(() => saveCalls).toBe(2);
  await expect(page.getByText('저장 대기 중')).not.toBeVisible();
  await expect(page.getByRole('heading', { name: '재미난 친구네 ?' })).toBeVisible();
});

async function startAndCrash(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: '개발용 mock 로그인' }).click();
  await page.getByRole('button', { name: '5PM RUSH 시작' }).click();
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getSnapshot?.().phase), { timeout: 8_000 }).toBe('running');
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getBoosterSnapshot?.().active), { timeout: 2_000 }).toBe(true);
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.deactivateBooster?.());
  await expect.poll(async () => page.evaluate(() => typeof window.__5PM_RUSH_TEST_API__?.spawnDemoObstacle)).toBe('function');
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.spawnDemoObstacle?.());
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getSnapshot?.().phase), { timeout: 5000 }).toBe('crashed');
}
