import Phaser from 'phaser';
import { GAME_CONFIG } from '../../game/config/gameConfig';
import { WORLD_TUNING } from '../../game/config/tuning/world';
import { CoworkerNpcEntity } from './CoworkerNpcEntity';
import type { CoworkerNpcSnapshot } from './coworkerNpcTypes';

export class CoworkerNpcField {
  private readonly npcs: CoworkerNpcEntity[];
  private readonly random: () => number;

  public constructor(private readonly scene: Phaser.Scene, random: () => number = Math.random) {
    this.random = random;
    this.npcs = Array.from({ length: WORLD_TUNING.coworker.poolSize }, (_, index) => new CoworkerNpcEntity(
      scene,
      `coworker-${index + 1}`,
      0,
      GAME_CONFIG.floorY,
    ));
    this.reset();
  }

  public update(deltaMs: number, worldSpeed: number, playerX: number, playerY: number, boosterActive: boolean): void {
    this.npcs.forEach((npc) => {
      npc.update(deltaMs, worldSpeed);
      if (npc.visible && npc.x < -WORLD_TUNING.coworker.despawnMarginPx) {
        npc.activate(this.getRightmostX() + WORLD_TUNING.coworker.spawnSpacingPx + this.random() * 80);
      }
    });
    this.reactToPlayer(playerX, playerY, boosterActive ? 'booster' : 'proximity');
  }

  public reactToPlayer(playerX: number, playerY: number, kind: 'booster' | 'landing' | 'proximity' = 'proximity'): void {
    this.npcs.forEach((npc) => {
      if (!npc.visible) return;
      const distance = Phaser.Math.Distance.Between(playerX, playerY, npc.x, npc.y - 40);
      if (kind === 'booster' || distance <= WORLD_TUNING.coworker.reactionRadiusPx) npc.reactToPlayer(kind);
    });
  }

  public reset(): void {
    this.npcs.forEach((npc, index) => npc.activate(
      GAME_CONFIG.width + WORLD_TUNING.coworker.spawnStartOffsetPx + index * WORLD_TUNING.coworker.spawnSpacingPx,
    ));
  }

  public getSnapshots(): CoworkerNpcSnapshot[] { return this.npcs.filter((npc) => npc.visible).map((npc) => npc.getSnapshot()); }

  public getDebugSnapshot(): { poolSize: number; activeCount: number; snapshots: CoworkerNpcSnapshot[] } {
    const snapshots = this.getSnapshots();
    return { poolSize: this.npcs.length, activeCount: snapshots.length, snapshots };
  }

  public destroy(): void { this.npcs.forEach((npc) => npc.destroy()); }

  private getRightmostX(): number {
    return this.npcs.reduce<number>((rightmost, npc) => Math.max(rightmost, npc.x), GAME_CONFIG.width);
  }
}
