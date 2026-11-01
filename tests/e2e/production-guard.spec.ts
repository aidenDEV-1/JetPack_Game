import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test, expect } from '@playwright/test';

test('production bundle에는 mock 로그인·테스트 hook·원본 사진이 없다', () => {
  const distRoot = resolve(process.cwd(), 'dist');
  expect(existsSync(distRoot)).toBe(true);
  const bundleText = collectFiles(distRoot).map((file) => readFileSync(file, 'utf8')).join('\n');
  expect(bundleText).not.toContain('__5PM_RUSH_TEST_API__');
  expect(bundleText).not.toContain('개발용 mock 로그인');
  expect(bundleText).not.toMatch(/(?:IMG_|photo)/i);

  const assetNames = collectFiles(resolve(process.cwd(), 'public/assets'));
  expect(assetNames.some((file) => /(?:IMG_|photo|original|face)/i.test(file))).toBe(false);
});

function collectFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(file) : [file];
  });
}
