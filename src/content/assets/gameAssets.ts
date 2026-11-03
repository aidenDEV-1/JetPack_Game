import type { AssetDefinition } from '../../services/assetRegistry';
import { PLAYER_SHEET_META } from './playerSheetMeta';

const backgroundScenes = ['office', 'security', 'city', 'subway-entrance', 'subway-inside', 'subway-exit', 'rooftop'] as const;
const backgroundLayers = ['l0', 'l1', 'l2', 'l3'] as const;
function getBackgroundPath(scene: (typeof backgroundScenes)[number], layer: (typeof backgroundLayers)[number]): string {
  return `/assets/backgrounds/${scene}-${layer}.png`;
}

export const gameAssetKeys = {
  playerSheet: 'player-spritesheet',
  boosterFormsSheet: 'booster-forms-spritesheet',
  jetpackFlameSheet: 'jetpack-flame-spritesheet',
  itemsSheet: 'items-spritesheet',
  obstaclesSheet: 'obstacles-spritesheet',
  laserEmitter: 'laser-emitter',
  backgrounds: Object.fromEntries(
    backgroundScenes.map((scene) => [scene, Object.fromEntries(backgroundLayers.map((layer) => [layer, `background-${scene}-${layer}`]))]),
  ) as Record<(typeof backgroundScenes)[number], Record<(typeof backgroundLayers)[number], string>>,
} as const;

const backgroundDefinitions: AssetDefinition[] = backgroundScenes.flatMap((scene) => backgroundLayers.map((layer) => ({
  key: gameAssetKeys.backgrounds[scene][layer],
  path: getBackgroundPath(scene, layer),
  kind: 'image' as const,
})));

export const gameAssetDefinitions: AssetDefinition[] = [
  {
    key: gameAssetKeys.playerSheet,
    path: PLAYER_SHEET_META.path,
    kind: 'spritesheet',
    frameWidth: PLAYER_SHEET_META.frameWidth,
    frameHeight: PLAYER_SHEET_META.frameHeight,
    frameCount: PLAYER_SHEET_META.frameCount,
  },
  {
    key: gameAssetKeys.boosterFormsSheet,
    path: '/assets/player/booster-backpack-spritesheet.png',
    kind: 'spritesheet',
    frameWidth: 384,
    frameHeight: 170,
    frameCount: 4,
  },
  {
    key: gameAssetKeys.jetpackFlameSheet,
    path: '/assets/player/jetpack-flame-spritesheet.png',
    kind: 'spritesheet',
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 4,
  },
  {
    key: gameAssetKeys.itemsSheet,
    path: '/assets/items/items-spritesheet.png',
    kind: 'spritesheet',
    frameWidth: 512,
    frameHeight: 512,
    frameCount: 3,
  },
  {
    key: gameAssetKeys.obstaclesSheet,
    path: '/assets/obstacles/obstacles-spritesheet.png',
    kind: 'spritesheet',
    frameWidth: 512,
    frameHeight: 512,
    frameCount: 6,
  },
  {
    key: gameAssetKeys.laserEmitter,
    path: '/assets/obstacles/laser-emitter.png',
    kind: 'image',
  },
  ...backgroundDefinitions,
];

