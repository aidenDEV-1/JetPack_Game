import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { error, log } from 'node:console';

const assetRoot = resolve(process.cwd(), 'public/assets');
const requiredDirectories = ['player', 'items', 'obstacles', 'backgrounds', 'ui'];
const requiredFiles = [
  'player/player-spritesheet.png',
  'player/booster-forms-spritesheet.png',
  'player/jetpack-flame-spritesheet.png',
  'items/items-spritesheet.png',
  'obstacles/obstacles-spritesheet.png',
  'obstacles/laser-emitter.png',
  'ui/coin-icon.svg',
  'ui/dex-token-icon.svg',
  'ui/shield-icon.svg',
  'ui/booster-icon.svg',
  'backgrounds/office.png',
  'backgrounds/security.png',
  'backgrounds/city.png',
  'backgrounds/subway.png',
  'backgrounds/rooftop.png',
];
const requiredSpritesheetMetadata = {
  'player/player-spritesheet.png': { width: 1536, height: 1190, frameWidth: 384, frameHeight: 170, frameCount: 28 },
  'obstacles/obstacles-spritesheet.png': { width: 1536, height: 1024, frameWidth: 512, frameHeight: 512, frameCount: 6 },
};
const requiredImageMetadata = {
  'obstacles/laser-emitter.png': { width: 256, height: 256 },
};

const failures = [];
requiredDirectories.forEach((directory) => {
  if (!existsSync(resolve(assetRoot, directory))) failures.push(`missing directory: ${directory}`);
});
requiredFiles.forEach((file) => {
  if (!existsSync(resolve(assetRoot, file))) failures.push(`missing file: ${file}`);
});

Object.entries(requiredSpritesheetMetadata).forEach(([file, metadata]) => {
  if (!existsSync(resolve(assetRoot, file))) return;
  const bytes = readFileSync(resolve(assetRoot, file));
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width !== metadata.width || height !== metadata.height || metadata.frameWidth <= 0 || metadata.frameHeight <= 0 || metadata.frameCount <= 0) {
    failures.push(`invalid spritesheet contract: ${file} (${width}x${height})`);
  }
});

Object.entries(requiredImageMetadata).forEach(([file, metadata]) => {
  if (!existsSync(resolve(assetRoot, file))) return;
  const bytes = readFileSync(resolve(assetRoot, file));
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width !== metadata.width || height !== metadata.height) failures.push(`invalid image contract: ${file} (${width}x${height})`);
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

