import { test, expect, type Page } from '@playwright/test';

test('mock 로그인으로 시작·아이템·부스터·충돌·결과를 재현한다', async ({ page }, testInfo) => {
  test.skip(Boolean(process.env.E2E_BASE_URL), '실제 Entra 인증 staging에서 수행');
  await page.setViewportSize({ width: 1280, height: 720 });
  const diagnostics = installRunDiagnostics(page);
  await page.route('**/api/runs', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ record: { bestDistanceMeters: 100, bestRunCoins: 5, bestScore: 150, totalCoins: 5 }, isNewBest: true }),
    });
  });
  await page.route('**/api/leaderboard', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ top10: [], currentUser: { rank: 1, displayName: '로컬 테스트 사용자', distanceMeters: 100, coins: 5, achievedAt: '2026-11-01T00:00:00.000Z' } }),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: '개발용 mock 로그인' }).click();
  await expect(page.getByRole('button', { name: '5PM RUSH 시작' })).toBeVisible();
  await page.getByRole('button', { name: '5PM RUSH 시작' }).click();
  await expect.poll(() => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getBackgroundSnapshot?.().scene), { timeout: 3_500 }).toBe('office');
  expect(await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getBackgroundSnapshot?.().segment)).toBe(0);
  await expect.poll(() => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getCoworkerNpcSnapshot?.().activeCount), { timeout: 3_500 }).toBe(6);
  expect(await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getCoworkerNpcSnapshot?.().snapshots.every((npc) => npc.collisionEnabled === false))).toBe(true);

  await expect(page.getByText('5:00:00')).toBeVisible({ timeout: 3_500 });
  await expect.poll(() => getRunSnapshot(page).then((snapshot) => snapshot?.phase), { timeout: 8_000 }).toBe('running');
  expect((await getRunSnapshot(page))?.missions.missions).toHaveLength(3);
  await expect.poll(() => getBoosterSnapshot(page).then((snapshot) => snapshot?.active), { timeout: 2_000 }).toBe(true);
  await expect.poll(() => getEffectsSnapshot(page).then((snapshot) => snapshot?.dustPoolSize), { timeout: 2_000 }).toBe(12);
  const effects = await getEffectsSnapshot(page);
  expect(effects).toMatchObject({ pickupPoolSize: 8, crashPoolSize: 16, boosterPoolSize: 2, hasPersistentTrail: false });
  const beforeMotion = await getRunSnapshot(page);
  await page.waitForTimeout(600);
  const afterMotion = await getRunSnapshot(page);
  expect(afterMotion?.distanceMeters ?? 0).toBeGreaterThan(beforeMotion?.distanceMeters ?? 0);
  await page.keyboard.press('f');
  await expect.poll(() => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getDebugSnapshot?.()), { timeout: 2_000 }).toMatchObject({
    activeChunkId: expect.any(String),
    speedPxPerSecond: expect.any(Number),
    coinsPerMinute: expect.any(Number),
    obstacleDensityPerMinute: expect.any(Number),
    boosterPhase: expect.any(String),
  });
  await page.screenshot({ path: testInfo.outputPath('debug-metrics.png') });
  await page.keyboard.press('f');
  const screenshot = await page.screenshot({ path: testInfo.outputPath('hud-arcade.png') });
  diagnostics.screenshotBytes = screenshot.byteLength;

  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.spawnDemoItems?.());
  await page.waitForTimeout(5_200);
  const afterItems = await getRunSnapshot(page);
  expect(afterItems?.runCoins ?? 0).toBeGreaterThan(0);
  await expect(page.locator('.hud-coins')).toHaveText(/[1-9]\d*/);

  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.activateBooster?.());
  await expect.poll(() => getBoosterSnapshot(page).then((snapshot) => snapshot?.active), { timeout: 2_000 }).toBe(true);
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.spawnDemoObstacle?.());
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.forceCrash?.());
  await expect.poll(() => getRunSnapshot(page).then((snapshot) => snapshot?.phase), { timeout: 3_000 }).toBe('crashed');
  await page.screenshot({ path: testInfo.outputPath('crash-feedback.png') });
  await expect(page.getByRole('heading', { name: '멋쟁이네~' })).toBeVisible({ timeout: 5_000 });

  expect(diagnostics.assetFailures).toEqual([]);
  expect(diagnostics.consoleErrors).toEqual([]);
  expect(diagnostics.screenshotBytes).toBeGreaterThan(10_000);
});

function installRunDiagnostics(page: Page) {
  const assetFailures: string[] = [];
  const consoleErrors: string[] = [];
  let screenshotBytes = 0;
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('response', (response) => {
    if (response.url().includes('/assets/') && response.status() >= 400) assetFailures.push(`${response.status()} ${response.url()}`);
  });
  page.on('requestfailed', (request) => {
    if (request.url().includes('/assets/')) assetFailures.push(request.url());
  });
  return {
    assetFailures,
    consoleErrors,
    get screenshotBytes() { return screenshotBytes; },
    set screenshotBytes(value: number) { screenshotBytes = value; },
  };
}

async function getRunSnapshot(page: Page) {
  return page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getSnapshot?.());
}

async function getBoosterSnapshot(page: Page) {
  return page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getBoosterSnapshot?.());
}

async function getEffectsSnapshot(page: Page) {
  return page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getEffectsSnapshot?.());
}
