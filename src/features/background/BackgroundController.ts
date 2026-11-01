import Phaser from 'phaser';
import { backgroundSegments } from '../../content/backgroundSegments';
import { backgroundLayerDefinitions, type BackgroundLayerDefinition } from '../../content/backgroundLayers';

interface BackgroundTile { sprite: Phaser.GameObjects.Rectangle; x: number; }

export class BackgroundController {
  private readonly tiles: Array<{ definition: BackgroundLayerDefinition; items: BackgroundTile[] }> = [];
  private currentSegment = -1;

  public constructor(private readonly scene: Phaser.Scene) {
    backgroundLayerDefinitions.forEach((definition, layerIndex) => {
      const items: BackgroundTile[] = [0, 1].map((index) => {
        const sprite = scene.add.rectangle(definition.repeatWidth * (index + 0.5), 360, definition.repeatWidth, 720, definition.colors[0]);
        sprite.setDepth(-10 + layerIndex);
        return { sprite, x: definition.repeatWidth * index };
      });
      this.tiles.push({ definition, items });
    });
  }

  public update(deltaMs: number, worldSpeed: number, segmentIndex: number): void {
    if (segmentIndex !== this.currentSegment) this.applySegmentStyle(segmentIndex);
    const deltaSeconds = deltaMs / 1000;
    this.tiles.forEach(({ definition, items }) => {
      items.forEach((tile) => {
        tile.x -= worldSpeed * definition.scrollFactor * deltaSeconds;
        if (tile.x + definition.repeatWidth < 0) tile.x += definition.repeatWidth * items.length;
        tile.sprite.x = tile.x + definition.repeatWidth / 2;
      });
    });
  }

  public getCurrentSegment(): number { return this.currentSegment; }

  private applySegmentStyle(segmentIndex: number): void {
    this.currentSegment = segmentIndex;
    const segmentColor = [0x203a5b, 0x2b3e50, 0x25314f, 0x1b3147, 0x101d38][segmentIndex] ?? 0x101d38;
    this.tiles.forEach(({ items }) => items.forEach((tile) => tile.sprite.setFillStyle(segmentColor)));
    this.scene.add.text(40, 100, backgroundSegments[segmentIndex]?.name ?? '야간 하늘·옥상', { color: '#f7c948', fontSize: '20px', fontStyle: 'bold' }).setDepth(-1);
  }
}
