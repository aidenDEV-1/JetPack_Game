import Phaser from 'phaser';
import { backgroundSegments, resolveBackgroundScene, resolveBackgroundSegmentIndex, type BackgroundSceneKey } from '../../content/backgroundSegments';
import { backgroundLayerDefinitions, type BackgroundLayerDefinition } from '../../content/backgroundLayers';

interface BackgroundTile {
  sprite: Phaser.GameObjects.Image;
  transitionSprite: Phaser.GameObjects.Image;
  x: number;
}

export interface BackgroundTransitionSnapshot {
  scene: BackgroundSceneKey;
  segment: number;
  transitionProgress: number;
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
  private transitionProgress = 1;
  private transitioning = false;
  private readonly transitionDurationMs = 220;

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
        const transitionSprite = scene.add.image(
          definition.repeatWidth * (index + 0.5),
          definition.y,
          definition.assetKeyByScene.office,
        );
        transitionSprite.setDisplaySize(definition.repeatWidth, definition.height);
        transitionSprite.setAlpha(0);
        transitionSprite.setDepth(definition.depth + 0.01);
        return { sprite, transitionSprite, x: definition.repeatWidth * index };
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
        tile.transitionSprite.x = tile.sprite.x;
      });
    });
    if (this.transitioning) {
      this.transitionProgress = Math.min(1, this.transitionProgress + Math.max(0, deltaMs) / this.transitionDurationMs);
      this.layers.forEach(({ definition, items }) => items.forEach((tile) => {
        tile.sprite.setAlpha(definition.alpha * (1 - this.transitionProgress));
        tile.transitionSprite.setAlpha(definition.alpha * this.transitionProgress);
      }));
      if (this.transitionProgress >= 1) {
        this.layers.forEach(({ definition, items }) => items.forEach((tile) => {
          tile.sprite.setTexture(tile.transitionSprite.texture.key).setAlpha(definition.alpha);
          tile.transitionSprite.setAlpha(0);
        }));
        this.transitioning = false;
      }
    }
  }

  public getCurrentSegment(): number { return this.currentSegment; }
  public getCurrentScene(): BackgroundSceneKey | null { return this.currentScene; }

  public getTransitionSnapshot(): BackgroundTransitionSnapshot {
    return {
      scene: this.currentScene ?? 'office',
      segment: Math.max(0, this.currentSegment),
      transitionProgress: this.transitionProgress,
    };
  }

  public reset(): void {
    this.layers.forEach(({ definition, items }) => {
      items.forEach((tile, index) => {
        tile.x = definition.repeatWidth * index;
        tile.sprite.x = tile.x + definition.repeatWidth / 2;
        tile.transitionSprite.x = tile.sprite.x;
      });
    });
    this.applyScene('office', 0, true);
  }

  private applyScene(sceneKey: BackgroundSceneKey, segmentIndex: number, immediate = false): void {
    const firstScene = this.currentScene === null;
    this.currentScene = sceneKey;
    this.currentSegment = segmentIndex;
    this.layers.forEach(({ definition, items }) => {
      const assetKey = definition.assetKeyByScene[sceneKey];
      items.forEach((tile) => {
        tile.transitionSprite.setTexture(assetKey).setDisplaySize(definition.repeatWidth, definition.height);
        if (firstScene || immediate) {
          tile.sprite.setTexture(assetKey).setDisplaySize(definition.repeatWidth, definition.height).setAlpha(definition.alpha);
          tile.transitionSprite.setAlpha(0);
        } else {
          tile.transitionSprite.setAlpha(0);
        }
      });
    });
    this.transitionProgress = firstScene || immediate ? 1 : 0;
    this.transitioning = !firstScene && !immediate;
    const segment = backgroundSegments[segmentIndex];
    const subwayDetail = sceneKey.startsWith('subway-') ? ` · ${sceneKey.replace('subway-', '')}` : '';
    this.segmentLabel.setText(`${segment?.name ?? '야간 하늘·옥상'}${subwayDetail}`);
  }
}

