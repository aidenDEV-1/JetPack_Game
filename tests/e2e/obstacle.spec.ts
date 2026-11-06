import { test, expect } from '@playwright/test';

test('로컬 플레이에서 장애물 충돌이 crash 상태를 만든다', async ({ page }, testInfo) => {
  test.skip(Boolean(process.env.E2E_BASE_URL), '실제 Entra 인증 staging에서 수행');
  await page.goto('/');
  await page.getByRole('button', { name: '개발용 mock 로그인' }).click();
  await page.getByRole('button', { name: '5PM RUSH 시작' }).click();
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getSnapshot?.().phase), { timeout: 8_000 }).toBe('running');
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getBoosterSnapshot?.().active), { timeout: 2_000 }).toBe(true);
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.deactivateBooster?.());
  await expect.poll(async () => page.evaluate(() => typeof window.__5PM_RUSH_TEST_API__?.spawnDemoObstacle)).toBe('function');
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.clearDemoObstacles?.());
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.spawnDemoLaser?.('vertical-laser'));
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getObstacleVisualSnapshot?.().find((obstacle) => obstacle.orientation === 'vertical')), { timeout: 2_000 }).toMatchObject({
    orientation: 'vertical',
    spanMode: 'random',
    beamWidth: 19,
    coreWidth: 3,
    emitterCount: 2,
  });
  const shortLaser = await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getObstacleVisualSnapshot?.().find((obstacle) => obstacle.orientation === 'vertical'));
  expect(shortLaser?.resolvedLength ?? 0).toBeGreaterThanOrEqual(216);
  expect(shortLaser?.resolvedLength ?? 0).toBeLessThanOrEqual(384);
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.clearDemoObstacles?.());
  await page.screenshot({ path: testInfo.outputPath('laser-mechanical.png') });
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getObstacleVisualSnapshot?.().find((obstacle) => obstacle.orientation === 'vertical')?.resolvedLength ?? 0), { timeout: 2_000 }).toBeLessThanOrEqual(192);
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.clearDemoObstacles?.());
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.spawnDemoLaser?.('horizontal-laser'));
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getObstacleVisualSnapshot?.().find((obstacle) => obstacle.orientation === 'horizontal')?.resolvedLength ?? 0), { timeout: 2_000 }).toBeLessThanOrEqual(192);
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.clearDemoObstacles?.());
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.spawnDemoWarningObstacle?.());
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getObstacleVisualSnapshot?.().find((obstacle) => obstacle.kind === 'missile')), { timeout: 2_000 }).toMatchObject({
    displayWidth: 144,
    displayHeight: 48,
    warning: { visible: true, label: '← 위험' },
  });
  const warning = await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getObstacleVisualSnapshot?.().find((obstacle) => obstacle.kind === 'missile')?.warning);
  expect(warning?.x ?? 0).toBeGreaterThan(1100);
  await page.screenshot({ path: testInfo.outputPath('security-obstacle-warning.png') });
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.clearDemoObstacles?.());
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.spawnDemoObstacle?.());
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getObstacleVisualSnapshot?.().find((obstacle) => obstacle.kind === 'monster')), { timeout: 2_000 }).toMatchObject({
    visualId: 'security-drone',
    motion: 'hover',
  });
  await page.screenshot({ path: testInfo.outputPath('security-drone.png') });
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getSnapshot?.().phase), { timeout: 5000 }).toBe('crashed');
});

