import { test, expect } from '@playwright/test';

test('로컬 플레이에서 시작 부스터와 재발동 비행이 실제 x축으로 이동한다', async ({ page }, testInfo) => {
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
  const boosterVisual = await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getPlayerVisualSnapshot?.());
  expect(boosterVisual).toMatchObject({
    animation: expect.not.stringMatching(/^running$/),
    renderRootCount: 1,
    playerChildCount: 2,
    jetpackAttachmentCount: 1,
    hasDebugBounds: false,
    hasPersistentTrail: false,
    flameVisible: true,
    jetpackActivity: 'boosting',
    flameParent: 'jetpack-attachment',
    sparkEmitterCount: 12,
    boosterStyleId: 'leather-rocket',
    rocketFormVisible: true,
    rocketFormParent: 'player-entity',
    hasDetachedBoosterRoot: false,
  });
  expect(boosterVisual?.bodyTextureKey).toBe('player-spritesheet');
  expect(boosterVisual?.collisionBounds.width).toBe(84);
  expect(boosterVisual?.collisionBounds.height).toBe(68);
  await page.screenshot({ path: testInfo.outputPath('player-animation-flight.png') });
  await page.screenshot({ path: testInfo.outputPath('rocket-booster-attached.png') });
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.deactivateBooster?.());
  const returned = await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getBoosterSnapshot?.());
  expect(returned).toMatchObject({ active: false, playerX: 220 });
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getPlayerVisualSnapshot?.().rocketFormVisible)).toBe(false);
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getPlayerVisualSnapshot?.().boosterMode)).toBe('normal');
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getPlayerVisualSnapshot?.().flameVisible)).toBe(false);
  const resetVisual = await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getPlayerVisualSnapshot?.());
  expect(resetVisual).toMatchObject({ flameParent: 'jetpack-attachment', sparkEmitterCount: 12, hasPersistentTrail: false });
  await page.evaluate(() => window.__5PM_RUSH_TEST_API__?.activateBooster?.());
  await expect.poll(async () => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getBoosterSnapshot?.().active)).toBe(true);
});

