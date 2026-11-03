# Task: T06 청크 생성기와 위협 패턴 연결

## Status: done

## Goal

실제 플레이에서 첫 30초 안에 장애물 3종, 코인 묶음 4개 이상, 경고 후 플레이어를 향해 빠르게 접근하는 미사일 1회를 경험하도록 `ObstacleField`와 `CollectibleField`를 청크 생성기에 연결한다.

## Decision Summary

- 시간 간격이 아니라 청크의 거리 좌표로 생성한다. 속도가 올라가도 패턴의 상대 모양과 빈 공간은 유지한다.
- 강제 패턴은 1100m 이상이며 방어막 pickup 생성 callback 이후에만 선택한다.

## Implementation

### I01. Chunk scheduler

- Related Files:
  - `src/features/chunks/ChunkScheduler.ts` :: `next`, `reset`; new
  - `src/features/obstacles/ObstacleField.ts` :: `update`, `spawn`; modify
  - `src/features/items/CollectibleField.ts` :: `spawnDueItems`, pattern spawn; modify
  - `src/game/scenes/RunScene.ts` :: shared distance scheduler wiring; modify

#### Details

```typescript
export interface ChunkSchedulerSnapshot { activeChunkId: string | null; nextDistanceMeters: number; }
export class ChunkScheduler {
  public next(distanceMeters: number, random: () => number): GameChunk;
  public reset(): void;
  public snapshot(): ChunkSchedulerSnapshot;
}
```

- scheduler는 `distanceMeters`가 `nextDistanceMeters`에 도달할 때만 다음 청크를 선택한다.
- seeded random을 주입하면 같은 seed에서 동일한 청크 순서·스크린샷을 만든다.
- `ObstacleField`는 청크의 obstacle spec을 `ObstacleEntity`로 변환하고, `CollectibleField`는 같은 청크의 item spec을 `ItemEntity`로 변환한다.
- 기존 `spawnDemo*` API는 개발 테스트용으로 유지하되 일반 생성 경로에서 사용하지 않는다.

### I02. Missile and hazard behaviors

- Related Files:
  - `src/features/obstacles/MissileEntity.ts` :: `update`, `getCollisionBounds`; new
  - `src/features/obstacles/ObstacleWarningIndicator.ts` :: warning lifecycle; modify
  - `src/features/obstacles/ObstacleEntity.ts` :: hazard dispatch; modify
  - `src/features/obstacles/obstaclePatterns.ts` :: pattern IDs and tuning refs; modify

#### Details

- 미사일 lifecycle은 `warning → launched → tracking → locked → offscreen`으로 정의한다.
- warning 단계는 화면 오른쪽 끝에서 깜빡이고, 발사 후에는 월드 속도보다 빠른 `missileSpeedMultiplier`로 왼쪽으로 이동한다.
- 플레이어의 현재 y를 매 프레임 따라가되 `lockDistancePx` 이후에는 고정하여 피할 수 있는 예측성을 남긴다.
- 레이저는 fixed/random/full span을 유지하고, 청크 좌표에 맞춰 생성한다.
- collision geometry는 시각 glow가 아니라 beam core와 emitter circle만 사용한다.

### I03. Collectible density and feedback hooks

- Related Files:
  - `src/features/items/movementPatterns.ts` :: line/arc/zigzag/orbit; modify
  - `src/features/items/ItemEntity.ts` :: pattern position; modify
  - `src/features/items/CollectibleField.ts` :: chunk item spawn; modify
  - `src/features/items/collectibleSpawn.test.ts` :: density and shield order; modify

#### Details

- 첫 30초 distance를 기본 speed와 튜닝으로 환산했을 때 최소 4개의 coin cluster가 생성되어야 한다.
- token 3개는 지나치게 쉽게 직선으로 먹지 않도록 zigzag/orbit 중 하나를 사용한다.
- 방어막은 `MIN_SHIELD_DISTANCE=1100` 이후에만 나타나며 cooldown과 중첩 금지를 유지한다.

## Acceptance Criteria

- [ ] 첫 30초에 장애물 3종·코인 묶음 4개·미사일 warning/launch를 재현할 수 있다.
- [ ] 속도 변경으로 청크 간격이 시간 기준으로 압축되지 않는다.
- [ ] 미사일은 warning 이후 빠르게 접근하지만 lock 전 피할 수 있다.
- [ ] forced 청크는 shield pickup 이후에만 생성된다.

## Validation

- `git pull --ff-only origin main`
- `npm run typecheck && npm run lint`
- `npm run test:run -- src/features/chunks src/features/items src/features/obstacles`
- `npm run test:e2e -- tests/e2e/collectible.spec.ts tests/e2e/obstacle.spec.ts --workers=1`
- `npm run validate:assets`

## Commit Message

```text
feat(gameplay): connect distance chunks to hazards and collectibles

Plan: 2026-11-03-5pm-rush-game-feel
Phase: P03-obstacle-and-coin-chunks
Task: T06-chunk-spawner-and-hazards

- Schedule obstacle and coin groups by world distance
- Add readable missile warning, tracking, and lock behavior
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: pending (현재 task 커밋에서 기록)
