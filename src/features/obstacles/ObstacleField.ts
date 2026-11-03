import Phaser from 'phaser';
import { GAME_CONFIG } from '../../game/config/gameConfig';
import { resolveObstacleCollision, type CollisionOutcome } from './CollisionResolver';
import { obstaclePatterns } from './obstaclePatterns';
import { ObstacleEntity } from './ObstacleEntity';
import { ObstacleSpawner } from './ObstacleSpawner';
import { resolveLaserGeometry } from './laserSpanResolver';
import { intersectsObstacleGeometry } from './obstacleCollisionGeometry';
import type { SpawnContext } from './obstacleTypes';
import { OBSTACLE_TUNING } from '../../game/config/tuning/obstacles';

export interface ObstacleFieldEvents {
  onHit: (outcome: CollisionOutcome) => void;
}

export class ObstacleField {
  private readonly obstacles: ObstacleEntity[] = [];
  private readonly spawner = new ObstacleSpawner();
  private readonly random: () => number;
  private elapsedSinceSpawn = 0;
  private nextSpawnDelay: number = OBSTACLE_TUNING.spawnDelayInitialMs;
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
      this.nextSpawnDelay = Math.max(
        OBSTACLE_TUNING.spawnDelayMinMs,
        Math.min(OBSTACLE_TUNING.spawnDelayMaxMs, OBSTACLE_TUNING.spawnDelayMaxMs - context.speed * OBSTACLE_TUNING.spawnDelaySpeedFactor),
      );
    }
    for (let index = this.obstacles.length - 1; index >= 0; index -= 1) {
      const obstacle = this.obstacles[index];
      obstacle.x -= context.speed * deltaSeconds;
      obstacle.updateVisual(this.scene.time.now, this.scene.scale.width);
      const intersects = intersectsObstacleGeometry(
        playerBounds,
        obstacle.x,
        obstacle.y,
        obstacle.getCollisionBoundsList(),
        obstacle.getCollisionCircles(),
      );
      if (intersects) {
        const outcome = resolveObstacleCollision({ invincible, hasShield });
        this.events.onHit(outcome);
        if (outcome !== 'crash') {
          obstacle.destroy();
          this.obstacles.splice(index, 1);
        } else {
          obstacle.hideWarning();
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
    this.nextSpawnDelay = OBSTACLE_TUNING.spawnDelayInitialMs;
    this.shieldPickupAhead = false;
    this.forcedPatternSegments.clear();
    this.stopped = false;
  }

  public setShieldPickupAhead(value: boolean): void { this.shieldPickupAhead = value; }

  public getVisualDebugSnapshot(): Array<ReturnType<ObstacleEntity['getVisualDebugSnapshot']>> {
    return this.obstacles.map((obstacle) => obstacle.getVisualDebugSnapshot());
  }

  public spawnDemoObstacle(): void {
    this.obstacles.push(new ObstacleEntity(this.scene, obstaclePatterns.find((pattern) => pattern.kind === 'monster')!, GAME_CONFIG.playerX + 60, GAME_CONFIG.floorY - OBSTACLE_TUNING.floorYSpawnOffsetPx));
  }

  public spawnDemoWarningObstacle(): void {
    this.obstacles.push(new ObstacleEntity(this.scene, obstaclePatterns.find((pattern) => pattern.kind === 'missile')!, GAME_CONFIG.width + 80, GAME_CONFIG.floorY - OBSTACLE_TUNING.floorYSpawnOffsetPx));
  }

  public spawnDemoLaser(patternId: string): void {
    const pattern = obstaclePatterns.find((candidate) => candidate.id === patternId && candidate.laserSpan);
    if (!pattern) return;
    const geometry = resolveLaserGeometry(pattern.laserSpan!, GAME_CONFIG, () => 0.5);
    const y = pattern.laserSpan?.orientation === 'vertical'
      ? (GAME_CONFIG.ceilingY + GAME_CONFIG.floorY) / 2
      : GAME_CONFIG.floorY - 180;
    this.obstacles.push(new ObstacleEntity(this.scene, pattern, GAME_CONFIG.width + OBSTACLE_TUNING.spawnXOffsetPx, y, geometry));
  }

  public clearDemoObstacles(): void {
    this.obstacles.forEach((obstacle) => obstacle.destroy());
    this.obstacles.length = 0;
  }

  private spawn(context: SpawnContext): void {
    const pattern = this.spawner.choosePattern(context, this.random);
    if (!pattern) return;
    if (pattern.requiresShield) this.forcedPatternSegments.add(Math.floor(context.distanceMeters / 1000));
    const y = pattern.id === 'forced-crossfire'
      ? GAME_CONFIG.floorY - 330
      : GAME_CONFIG.ceilingY + OBSTACLE_TUNING.verticalSpawnMarginPx + this.random() * (GAME_CONFIG.floorY - GAME_CONFIG.ceilingY - OBSTACLE_TUNING.verticalSpawnMarginPx * 2);
    const laserGeometry = pattern.laserSpan
      ? resolveLaserGeometry(pattern.laserSpan, GAME_CONFIG, this.random)
      : undefined;
    this.obstacles.push(new ObstacleEntity(this.scene, pattern, GAME_CONFIG.width + OBSTACLE_TUNING.spawnXOffsetPx, y, laserGeometry));
  }
}

