import Phaser from 'phaser';
import { GAME_CONFIG } from '../../game/config/gameConfig';
import { ItemEntity } from './ItemEntity';
import type { ItemKind, TokenPattern } from './itemTypes';
import { getNextShieldDistance, getSpawnInterval, MIN_SHIELD_DISTANCE } from './collectibleSpawn';
import { ITEM_TUNING } from '../../game/config/tuning/items';
import type { ChunkCollectiblePattern, GameChunk } from '../chunks/chunkTypes';

export interface CollectibleFieldEvents {
  onCollect: (kind: ItemKind, x: number, y: number) => void;
}

export class CollectibleField {
  private readonly items: ItemEntity[] = [];
  private readonly random: () => number;
  private elapsedMs = 0;
  private nextCoinDistance = 0;
  private nextTokenDistance = 120;
  private nextShieldDistance: number = MIN_SHIELD_DISTANCE;
  private shieldHeld = false;
  private chunkSchedulingEnabled = false;

  public constructor(private readonly scene: Phaser.Scene, private readonly events: CollectibleFieldEvents, random: () => number = Math.random) {
    this.random = random;
  }

  public update(deltaMs: number, distanceMeters: number, worldSpeed: number, playerBounds: Phaser.Geom.Rectangle): void {
    this.elapsedMs += Math.max(0, deltaMs);
    if (!this.chunkSchedulingEnabled) this.spawnDueItems(distanceMeters);
    this.items.forEach((item) => {
      item.update(deltaMs, worldSpeed, this.elapsedMs);
      if (!item.isCollected() && Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, item.getCollisionBounds())) {
        const { x, y } = item;
        if (item.collect()) this.events.onCollect(item.kind, x, y);
      }
    });
    for (let index = this.items.length - 1; index >= 0; index -= 1) {
      const item = this.items[index];
      if (item.isCollected() || item.x < -120) {
        item.destroy();
        this.items.splice(index, 1);
      }
    }
  }

  public reset(): void {
    this.items.forEach((item) => item.destroy());
    this.items.length = 0;
    this.elapsedMs = 0;
    this.nextCoinDistance = 0;
    this.nextTokenDistance = 120;
    this.nextShieldDistance = MIN_SHIELD_DISTANCE;
    this.shieldHeld = false;
  }

  public setShieldHeld(value: boolean): void { this.shieldHeld = value; }
  public enableChunkScheduling(): void { this.chunkSchedulingEnabled = true; }

  public spawnChunk(chunk: GameChunk): void {
    const playableHeight = GAME_CONFIG.floorY - GAME_CONFIG.ceilingY;
    chunk.collectibles.forEach((spec) => {
      const x = GAME_CONFIG.width + 80 + spec.xMeters * GAME_CONFIG.pixelsPerMeter;
      const y = Phaser.Math.Clamp(GAME_CONFIG.ceilingY + playableHeight * spec.yRatio, ITEM_TUNING.spawnYMinPx, GAME_CONFIG.floorY - ITEM_TUNING.spawnYMinPx);
      if (spec.kind === 'coin') this.spawnCoinCluster(x, y, spec.pattern);
      if (spec.kind === 'token') this.spawnTokenCluster(x, y, spec.pattern);
      if (spec.kind === 'shield' && !this.shieldHeld && !this.hasActiveShieldPickup()) {
        this.spawnShield(x, y);
      }
    });
  }

  public spawnDemoItems(): void {
    this.spawnCoinCluster(1320, 540);
    this.spawnTokenCluster(1580, 430);
    this.spawnShield(1840, 500);
  }

  private spawnDueItems(distanceMeters: number): void {
    if (distanceMeters >= this.nextCoinDistance) {
      this.spawnCoinCluster(GAME_CONFIG.width + 80, ITEM_TUNING.spawnYMinPx + this.random() * ITEM_TUNING.spawnYRangePx);
      this.nextCoinDistance = distanceMeters + getSpawnInterval('coin', this.random);
    }
    if (distanceMeters >= this.nextTokenDistance) {
      this.spawnTokenCluster(GAME_CONFIG.width + 140, ITEM_TUNING.spawnYMinPx + this.random() * ITEM_TUNING.spawnYRangePx);
      this.nextTokenDistance = distanceMeters + getSpawnInterval('token', this.random);
    }
    if (distanceMeters >= this.nextShieldDistance && !this.shieldHeld && !this.hasActiveShieldPickup()) {
      this.spawnShield(GAME_CONFIG.width + 220, ITEM_TUNING.spawnYMinPx + this.random() * ITEM_TUNING.spawnYRangePx);
      this.nextShieldDistance = getNextShieldDistance(distanceMeters, this.random);
    }
  }

  private spawnCoinCluster(x: number, y: number, pattern: ChunkCollectiblePattern = 'arc'): void {
    for (let index = 0; index < ITEM_TUNING.coinClusterCount; index += 1) {
      const progress = index / Math.max(1, ITEM_TUNING.coinClusterCount - 1);
      this.items.push(new ItemEntity(this.scene, 'coin', x + index * 58, y + getPatternOffset(pattern, progress)));
    }
  }

  private spawnTokenCluster(x: number, y: number, pattern: ChunkCollectiblePattern = 'zigzag'): void {
    for (let index = 0; index < ITEM_TUNING.tokenClusterCount; index += 1) {
      this.items.push(new ItemEntity(this.scene, 'token', x + index * 86, y + (index - 1) * 56, mapTokenPattern(pattern, this.random)));
    }
  }

  private spawnShield(x: number, y: number): void {
    this.items.push(new ItemEntity(this.scene, 'shield', x, y));
  }

  private hasActiveShieldPickup(): boolean {
    return this.items.some((item) => item.kind === 'shield' && !item.isCollected());
  }
}

function getPatternOffset(pattern: ChunkCollectiblePattern, progress: number): number {
  if (pattern === 'line') return 0;
  if (pattern === 'zigzag') return progress % 0.5 < 0.25 ? -30 : 30;
  if (pattern === 'orbit') return Math.cos(progress * Math.PI * 2) * 28;
  return -Math.sin(progress * Math.PI) * 34;
}

function mapTokenPattern(pattern: ChunkCollectiblePattern, random: () => number): TokenPattern {
  if (pattern === 'orbit') return 'orbit';
  if (pattern === 'zigzag') return 'wave';
  if (pattern === 'arc') return random() > 0.5 ? 'vertical' : 'wave';
  return 'horizontal';
}

