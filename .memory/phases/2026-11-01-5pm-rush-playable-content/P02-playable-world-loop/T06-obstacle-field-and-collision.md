# Task: T06 Obstacle Field and Collision

## Status: pending

## Goal

현재 선언만 되어 있는 `ObstacleSpawner`와 `ObstacleEntity`를 실제 장애물 field로 연결한다. 레이저·미사일·몬스터가 우측에서 생성되어 이동하고, 경고 화살표가 있는 패턴은 미리 표시되며, 플레이어와 충돌 시 booster/방어막 규칙을 거쳐 crash flow를 시작해야 한다.

## Decision Summary

- 장애물 충돌은 `PlayerEntity.getCollisionBounds()`와 `ObstacleEntity.getCollisionBounds()`의 overlap만 사용한다. 위쪽 max-height bounce와 화면 바깥 이탈은 장애물 충돌로 취급하지 않는다.
- 강제 회피 불가 패턴은 같은 segment에서 최대 한 번, `distanceMeters >= 1100`, 앞쪽 방어막 pickup이 이미 spawn된 경우에만 선택한다. shield가 없으면 반드시 crash될 수 있지만 shield가 있으면 소모하고 진행한다.

## Implementation

### I01. ObstacleEntity bounds와 asset rendering

- Related Files:
  - `src/features/obstacles/ObstacleEntity.ts` :: `ObstacleEntity` — 도형 hazard를 asset/texture로 교체; modify
  - `src/features/obstacles/obstacleTypes.ts` :: `ObstaclePattern`, `SpawnContext` — spawn position/bounds metadata 확장; modify

#### Details

- `ObstacleEntity`는 `obstacle-laser-vertical`, `obstacle-laser-horizontal`, `obstacle-missile`, `obstacle-monster` asset key를 사용한다. warning arrow는 `Phaser.GameObjects.Image` 또는 현재 text를 유지할 수 있지만, 장애물 자체의 x가 -100 아래로 갈 때 함께 제거한다.
- `getCollisionBounds()`는 pattern width/height에서 emitter glow와 warning arrow를 제외한 hitbox를 반환한다. forced-crossfire는 실제 레이저 두 줄의 gap을 계산할 수 있도록 child hitboxes를 별도로 저장한다.
- `destroy()` 시 child image, warning arrow, glow tween이 모두 정리되어 수십 초 플레이 후 GameObject가 누적되지 않게 한다.

### I02. Spawn/update/collision field

- Related Files:
  - `src/features/obstacles/ObstacleField.ts` :: `ObstacleField`, `ObstacleFieldEvents` — obstacle lifecycle; new
  - `src/features/obstacles/ObstacleSpawner.ts` :: pattern choice/cooldown — modify
  - `src/features/obstacles/__tests__/ObstacleField.test.ts` — spawn/collision/forced pattern tests; new
  - `src/game/scenes/RunScene.ts` :: field update/collision callback — modify

#### Details

- 계약은 다음으로 고정한다.

  ```typescript
  export interface ObstacleFieldEvents {
    onHit: (outcome: CollisionOutcome) => void;
  }

  export class ObstacleField {
    public update(
      deltaMs: number,
      context: SpawnContext,
      playerBounds: Phaser.Geom.Rectangle,
      invincible: boolean,
      hasShield: boolean,
    ): void;
    public reset(): void;
  }
  ```

- spawn timer는 speed/distance에 따라 0.9~1.7초 간격으로 조정한다. x는 `GAME_CONFIG.width + 100`에서 시작하고, y는 ceiling+55~floor-55 사이에서 선택한다. vertical/horizontal pattern은 화면을 막더라도 `ObstacleSpawner.validateReachability`가 허용한 gap을 남겨야 한다.
- `hasShieldPickupAhead`는 T05 field가 event로 전달한 값을 context에 넣는다. `canUseForcedPattern`이 false인 동안 forced-crossfire를 선택하지 않는다. 같은 1000m segment에서 중복 사용하지 않는다.
- player overlap 시 `resolveObstacleCollision({invincible, hasShield})`를 호출한다. `ignored-by-booster`는 obstacle을 제거하고 계속 진행, `blocked-by-shield`는 shield를 소비하고 hit feedback만 표시, `crash`는 `GameState.crash()`와 `onHit`을 한 번만 호출한다.
- collision 이후에는 더 이상 spawn/update하지 않고 `RunScene`이 T08의 crash sequence를 호출한다.

### I03. Boundary/forced-pattern regression tests

- Related Files:
  - `src/features/obstacles/ObstacleSpawner.ts` :: forced eligibility — tests only after 1100m/shield ahead
  - `src/game/systems/RunMotionSystem.test.ts` :: ceiling bounce/floor running tests — modify or new

#### Details

- 테스트는 `distanceMeters: 1099`에서 forced pattern 없음, `1100` 이후 shield ahead + segment unused에서만 가능, shield 없는 collision은 crash, shield 있는 collision은 shield consumed, booster active collision은 ignored를 검증한다.
- `RunMotionSystem` 테스트는 ceiling contact가 crash event를 만들지 않고 velocity가 bounce 방향으로 바뀌는지, floor contact가 grounded=true가 되는지 검증한다.

## Acceptance Criteria

- [ ] 레이저·미사일·몬스터가 우측에서 실제로 등장해 화면을 가로질러 이동한다.
- [ ] warning arrow 장애물은 충돌 전에 보이고, 화면 밖에서 정리된다.
- [ ] forced pattern이 shield pickup 이후/1100m 이후에만 등장한다.
- [ ] booster는 충돌을 무시하고, shield는 한 번의 충돌을 막은 뒤 사라지며, 그 외 충돌은 crash flow를 시작한다.
- [ ] 상단 경계 접촉은 충돌 종료가 아니고, 바닥에서는 player가 running animation을 사용한다.

## Validation

- `npm run test:run -- src/features/obstacles src/game/systems` — collision/forced/boundary tests 통과
- `npm run typecheck` — ObstacleField와 RunScene 타입 오류 없음
- `npm run test:e2e -- --grep "obstacle|collision"` — deterministic hazard가 실제 crash/방어막 결과를 발생시킴

## Commit Message

```text
feat(obstacles): connect hazard spawning and collision resolution

Plan: 2026-11-01-5pm-rush-playable-content
Phase: P02-playable-world-loop
Task: T06-obstacle-field-and-collision

- spawn visible lasers, missiles, and monsters in the run loop
- enforce shield-gated forced patterns and collision outcomes
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending

