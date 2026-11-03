import { test, expect } from '@playwright/test';

test('거리 구간별 배경 레이어를 캡처한다', async ({ page }, testInfo) => {
  test.skip(Boolean(process.env.E2E_BASE_URL), '실제 Entra 인증 staging에서 수행');
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await page.getByRole('button', { name: '개발용 mock 로그인' }).click();
  await page.getByRole('button', { name: '5PM RUSH 시작' }).click();
  await expect.poll(() => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getSnapshot?.().phase), { timeout: 8_000 }).toBe('running');

  const captures = [
    { distance: 0, scene: 'office', file: '0m-start.png' },
    { distance: 1000, scene: 'security', file: '1000m-security.png' },
    { distance: 2000, scene: 'city', file: '2000m-city.png' },
    { distance: 3000, scene: 'subway-entrance', file: '3000m-subway-entrance.png' },
    { distance: 3500, scene: 'subway-inside', file: '3500m-subway-inside.png' },
    { distance: 4000, scene: 'rooftop', file: '4000m-rooftop.png' },
  ] as const;
  for (const capture of captures) {
    await page.evaluate((distance) => window.__5PM_RUSH_TEST_API__?.previewBackgroundAt?.(distance), capture.distance);
    await expect.poll(() => page.evaluate(() => window.__5PM_RUSH_TEST_API__?.getBackgroundSnapshot?.().scene), { timeout: 2_000 }).toBe(capture.scene);
    await page.screenshot({ path: testInfo.outputPath(capture.file) });
  }
});
