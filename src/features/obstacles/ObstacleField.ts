import Phaser from 'phaser';
import { GAME_CONFIG } from '../../game/config/gameConfig';
import { resolveObstacleCollision, type CollisionOutcome } from './CollisionResolver';
import { obstaclePatterns } from './obstaclePatterns';
import { ObstacleEntity } from './ObstacleEntity';
import { ObstacleSpawner } from './ObstacleSpawner';
import type { SpawnContext } from './obstacleTypes';

export interface ObstacleFieldEvents {
  onHit: (outcome: CollisionOutcome) => void;
}

export class ObstacleField {
  private readonly obstacles: ObstacleEntity[] = [];
  private readonly spawner = new ObstacleSpawner();
  private readonly random: () => number;
  private elapsedSinceSpawn = 0;
  private nextSpawnDelay = 1400;
  private shieldPickupAhead = false;
  private readonly forcedPatternSegments = new Set<number>();
  private stopped = false;

  public constructor(private readonly scene: Phaser.Scene, private readonly events: ObstacleFieldEvents, random: () => number = Math.random) {
    this.random = random;
  }

  public update(deltaMs: number, context: SpawnContext, playerBounds: Phaser.Geom.Rectangle, invincible: boolean, hasShield: boolean): void {
    if (this.stopped) return;
    const deltaSeconds = Math.max(0, deltaMs) / 1000;
    this.elapsedSinceSpawn += Math.max(0, deltaMs);
    const segment = Math.floor(context.distanceMeters / 1000);
    const patternContext: SpawnContext = {
      ...context,
      hasShieldPickupAhead: this.shieldPickupAhead,
      forcedPatternUsedInSegment: this.forcedPatternSegments.has(segment),
    };
    if (this.elapsedSinceSpawn >= this.nextSpawnDelay) {
      this.spawn(patternContext);
      this.elapsedSinceSpawn = 0;
      this.nextSpawnDelay = Math.max(900, Math.min(1700, 1700 - context.speed * 0.5));
    }
    for (let index = this.obstacles.length - 1; index >= 0; index -= 1) {
      const obstacle = this.obstacles[index];
      obstacle.x -= context.speed * deltaSeconds;
      const intersects = obstacle.getCollisionBoundsList().some((hitbox) => {
        const worldBounds = new Phaser.Geom.Rectangle(obstacle.x + hitbox.x, obstacle.y + hitbox.y, hitbox.width, hitbox.height);
        return Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, worldBounds);
      });
      if (intersects) {
        const outcome = resolveObstacleCollision({ invincible, hasShield });
        this.events.onHit(outcome);
        if (outcome !== 'crash') {
          obstacle.destroy();
          this.obstacles.splice(index, 1);
        } else {
          this.stopped = true;
        }
        continue;
      }
      if (obstacle.isOffscreen()) {
        obstacle.destroy();
        this.obstacles.splice(index, 1);
      }
    }
  }

  public reset(): void {
    this.obstacles.forEach((obstacle) => obstacle.destroy());
    this.obstacles.length = 0;
    this.elapsedSinceSpawn = 0;
    this.nextSpawnDelay = 1400;
    this.shieldPickupAhead = false;
    this.forcedPatternSegments.clear();
    this.stopped = false;
  }

  public setShieldPickupAhead(value: boolean): void { this.shieldPickupAhead = value; }

  public spawnDemoObstacle(): void {
    this.obstacles.push(new ObstacleEntity(this.scene, obstaclePatterns.find((pattern) => pattern.kind === 'monster')!, GAME_CONFIG.playerX + 60, GAME_CONFIG.floorY - 55));
  }

  private spawn(context: SpawnContext): void {
    const pattern = this.spawner.choosePattern(context, this.random);
    if (!pattern) return;
    if (pattern.requiresShield) this.forcedPatternSegments.add(Math.floor(context.distanceMeters / 1000));
    const y = pattern.id === 'forced-crossfire'
      ? GAME_CONFIG.floorY - 330
      : GAME_CONFIG.ceilingY + 55 + this.random() * (GAME_CONFIG.floorY - GAME_CONFIG.ceilingY - 110);
    this.obstacles.push(new ObstacleEntity(this.scene, pattern, GAME_CONFIG.width + 100, y));
  }
}

