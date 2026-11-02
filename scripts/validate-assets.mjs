import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { error, log } from 'node:console';

const assetRoot = resolve(process.cwd(), 'public/assets');
const requiredDirectories = ['player', 'items', 'obstacles', 'backgrounds', 'ui'];
const requiredFiles = [
  'player/player-spritesheet.png',
  'player/booster-forms-spritesheet.png',
  'items/items-spritesheet.png',
  'obstacles/obstacles-spritesheet.png',
  'ui/booster-vfx-spritesheet.png',
  'backgrounds/office.png',
  'backgrounds/security.png',
  'backgrounds/city.png',
  'backgrounds/subway.png',
  'backgrounds/rooftop.png',
];

const failures = [];
requiredDirectories.forEach((directory) => {
  if (!existsSync(resolve(assetRoot, directory))) failures.push(`missing directory: ${directory}`);
});
requiredFiles.forEach((file) => {
  if (!existsSync(resolve(assetRoot, file))) failures.push(`missing file: ${file}`);
});

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

if (existsSync(assetRoot)) {
  walk(assetRoot).forEach((file) => {
    if (/(?:^|\/)(?:IMG_|photo|original|face)[^/]*$/i.test(file)) failures.push(`original-photo-like file: ${file}`);
  });
} else {
  failures.push(`missing asset root: ${assetRoot}`);
}

if (failures.length > 0) {
  error(failures.join('\n'));
  process.exitCode = 1;
} else {
  log(`validated ${requiredFiles.length} required game assets`);
}

