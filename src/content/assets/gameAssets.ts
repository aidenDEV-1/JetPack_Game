import type { AssetDefinition } from '../../services/assetRegistry';

const backgroundScenes = ['office', 'security', 'city', 'subway-entrance', 'subway-inside', 'subway-exit', 'rooftop'] as const;
const backgroundLayers = ['far', 'mid', 'near'] as const;
const backgroundFileByScene: Record<(typeof backgroundScenes)[number], string> = {
  office: 'office',
  security: 'security',
  city: 'city',
  'subway-entrance': 'subway',
  'subway-inside': 'subway',
  'subway-exit': 'subway',
  rooftop: 'rooftop',
};

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
  path: `/assets/backgrounds/${backgroundFileByScene[scene]}.png`,
  kind: 'image' as const,
})));

export const gameAssetDefinitions: AssetDefinition[] = [
  {
    key: gameAssetKeys.playerSheet,
    path: '/assets/player/player-spritesheet.png',
    kind: 'spritesheet',
    frameWidth: 384,
    frameHeight: 170,
    frameCount: 28,
  },
  {
    key: gameAssetKeys.boosterFormsSheet,
    path: '/assets/player/booster-forms-spritesheet.png',
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

