import Phaser from 'phaser';
import { backgroundSegments, resolveBackgroundScene, resolveBackgroundSegmentIndex, type BackgroundSceneKey } from '../../content/backgroundSegments';
import { backgroundLayerDefinitions, type BackgroundLayerDefinition } from '../../content/backgroundLayers';

interface BackgroundTile {
  sprite: Phaser.GameObjects.Image;
  x: number;
}

interface BackgroundLayer {
  definition: BackgroundLayerDefinition;
  items: BackgroundTile[];
}

export class BackgroundController {
  private readonly layers: BackgroundLayer[] = [];
  private readonly segmentLabel: Phaser.GameObjects.Text;
  private currentScene: BackgroundSceneKey | null = null;
  private currentSegment = -1;

  public constructor(private readonly scene: Phaser.Scene) {
    this.segmentLabel = scene.add.text(40, 100, '', {
      color: '#f7c948',
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      stroke: '#07111f',
      strokeThickness: 5,
    }).setDepth(-1);

    backgroundLayerDefinitions.forEach((definition) => {
      const items: BackgroundTile[] = [0, 1].map((index) => {
        const sprite = scene.add.image(
          definition.repeatWidth * (index + 0.5),
          definition.y,
          definition.assetKeyByScene.office,
        );
        sprite.setDisplaySize(definition.repeatWidth, definition.height);
        sprite.setAlpha(definition.alpha);
        sprite.setDepth(definition.depth);
        return { sprite, x: definition.repeatWidth * index };
      });
      this.layers.push({ definition, items });
    });
    this.applyScene('office', 0);
  }

  public update(deltaMs: number, worldSpeed: number, distanceMeters: number): void {
    const sceneKey = resolveBackgroundScene(distanceMeters);
    const segmentIndex = resolveBackgroundSegmentIndex(distanceMeters);
    if (sceneKey !== this.currentScene || segmentIndex !== this.currentSegment) {
      this.applyScene(sceneKey, segmentIndex);
    }
    const deltaSeconds = Math.max(0, deltaMs) / 1000;
    this.layers.forEach(({ definition, items }) => {
      items.forEach((tile) => {
        tile.x -= worldSpeed * definition.scrollFactor * deltaSeconds;
        while (tile.x + definition.repeatWidth < 0) tile.x += definition.repeatWidth * items.length;
        tile.sprite.x = tile.x + definition.repeatWidth / 2;
      });
    });
  }

  public getCurrentSegment(): number { return this.currentSegment; }
  public getCurrentScene(): BackgroundSceneKey | null { return this.currentScene; }

  private applyScene(sceneKey: BackgroundSceneKey, segmentIndex: number): void {
    this.currentScene = sceneKey;
    this.currentSegment = segmentIndex;
    this.layers.forEach(({ definition, items }) => {
      const assetKey = definition.assetKeyByScene[sceneKey];
      items.forEach((tile) => {
        tile.sprite.setTexture(assetKey);
        tile.sprite.setDisplaySize(definition.repeatWidth, definition.height);
      });
    });
    const segment = backgroundSegments[segmentIndex];
    const subwayDetail = sceneKey.startsWith('subway-') ? ` · ${sceneKey.replace('subway-', '')}` : '';
    this.segmentLabel.setText(`${segment?.name ?? '야간 하늘·옥상'}${subwayDetail}`);
  }
}

