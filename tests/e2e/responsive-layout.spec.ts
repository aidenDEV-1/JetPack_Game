import { test, expect } from '@playwright/test';

test('게임 프레임과 Phaser canvas가 브라우저 너비에 맞춰 확대된다', async ({ page }) => {
  test.skip(Boolean(process.env.E2E_BASE_URL), '실제 Entra 인증 staging에서 수행');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: '개발용 mock 로그인' }).click();
  await expect(page.getByRole('button', { name: '5PM RUSH 시작' })).toBeVisible();

  const narrow = await readLayout(page);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect.poll(async () => (await readLayout(page)).frame.width).toBeGreaterThan(narrow.frame.width + 400);

  const wide = await readLayout(page);
  expect(wide.frame.height / wide.frame.width).toBeCloseTo(9 / 16, 2);
  expect(Math.abs(wide.canvas.width - wide.frame.contentWidth)).toBeLessThanOrEqual(2);
  expect(Math.abs(wide.canvas.height - wide.frame.contentHeight)).toBeLessThanOrEqual(2);
  expect(wide.canvas.left).toBeGreaterThanOrEqual(wide.frame.left);
  expect(wide.canvas.top).toBeGreaterThanOrEqual(wide.frame.top);
  expect(wide.canvas.right).toBeLessThanOrEqual(wide.frame.right);
  expect(wide.canvas.bottom).toBeLessThanOrEqual(wide.frame.bottom);

  await page.setViewportSize({ width: 800, height: 900 });
  const small = await readLayout(page);
  expect(small.frame.width).toBeLessThan(wide.frame.width);
  expect(small.frame.height / small.frame.width).toBeCloseTo(9 / 16, 2);
  await expect(page.getByRole('button', { name: '5PM RUSH 시작' })).toBeVisible();
});

async function readLayout(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const frame = document.querySelector<HTMLElement>('.game-frame')?.getBoundingClientRect();
    const canvas = document.querySelector<HTMLCanvasElement>('.game-root canvas')?.getBoundingClientRect();
    if (!frame || !canvas) throw new Error('게임 프레임 또는 Phaser canvas가 아직 생성되지 않았습니다.');
    return {
      frame: {
        width: frame.width,
        height: frame.height,
        contentWidth: frame.width - 2,
        contentHeight: frame.height - 2,
        left: frame.left,
        top: frame.top,
        right: frame.right,
        bottom: frame.bottom,
      },
      canvas: { width: canvas.width, height: canvas.height, left: canvas.left, top: canvas.top, right: canvas.right, bottom: canvas.bottom },
    };
  });
}
