# Task: T02 오른쪽 진입 미사일 빈도 증가

## Status: pending

## Goal

오른쪽 경고 영역에서 생성되어 왼쪽으로 날아오는 미사일 장애물이 특정 청크에만 드물게 등장하는 문제를 해결한다. 정상 거리 청크 A~E 모두에 예측 가능한 warning 미사일을 최소 하나씩 배치해 플레이 중 진입 장애물 빈도를 높이고, 경고가 장애물보다 먼저 오른쪽 끝에 표시되는 기존 UX를 보존한다.

## Decision Summary

- 미사일은 `patternId: 'missile'`, `warning: true`를 사용하는 authored chunk obstacle로 늘린다. 모든 obstacle의 전역 spawn interval을 무작정 줄여 화면을 과밀하게 만들지 않는다.
- 미사일은 충돌 면역이나 강제 즉사 패턴이 아니며, warning 이후 회피 가능한 y 위치를 사용한다.

## Implementation

### I01. 표준 청크에 warning 미사일을 분산 배치

- Related Files:
  - `src/features/chunks/chunkCatalog.ts` :: `CHUNK_CATALOG` — 거리별 obstacle composition; modify
  - `src/features/chunks/chunkTypes.ts` :: `ChunkObstacleSpec` — warning/position schema; read-only unless T01 changes it
  - `src/features/chunks/chunkReachability.ts` :: `validateChunkReachability` — 새 미사일 배치의 gap/collectible 교차 검증; read-only or modify only if T01 removed fields
  - `src/features/chunks/__tests__/chunkReachability.test.ts` :: authored chunk validation; modify
  - `src/features/playtest/DeterministicRunSimulator.ts` :: deterministic obstacle counters; read-only
  - `src/features/playtest/__tests__/DeterministicRunSimulator.test.ts` :: 30-second frequency contract; modify

#### Details

- A, C, D 청크에 각각 warning 미사일을 하나씩 추가한다. B와 E의 기존 미사일은 유지한다. 따라서 현재 거리 설계의 일반 청크 A~E는 모두 적어도 하나의 `missile`을 가진다.
- 추가 미사일의 권장 authored spec은 다음과 같다. 기존 같은 x column의 레이저/드론과 겹치지 않도록 x를 `112m`로 두고, yRatio는 `0.52~0.62` 범위에서 해당 청크의 collectible 및 다른 obstacle과 겹치지 않는 값으로 선택하며, `heightRatio: 0.14`, `warning: true`, `forced: false`를 사용한다. T01에서 `forced` 필드를 제거했다면 해당 필드는 생략한다.
- 미사일의 x 위치는 `ObstacleField.spawnChunk`가 `scene.scale.width + spawnXOffsetPx + xMeters * pixelsPerMeter`로 오른쪽 바깥에서 시작시키는 기존 흐름을 사용한다. `MissileEntity`의 왼쪽 이동·추적 동작은 변경하지 않는다.
- 미사일 warning은 `ObstacleEntity.updateVisual`과 `ObstacleWarningIndicator.show(viewportWidth, obstacleY)`를 계속 사용해 장애물이 화면 오른쪽 끝에 들어오기 전에 `← 위험` 표시가 나타나게 한다. warning을 장애물 중앙이나 좌측에 고정하지 않는다.
- 같은 청크의 authored 미사일과 coin/token/shield가 동일 x column에서 충돌하거나 collectible validation을 깨지 않도록 x 차이 18m 이상 또는 yRatio가 hitbox 밖인 조합을 사용한다. `validateChunkReachability` 결과가 빈 배열이어야 한다.

### I02. 빈도·회귀 계약을 결정적 테스트로 고정

- Related Files:
  - `src/features/playtest/__tests__/DeterministicRunSimulator.test.ts` :: `deterministic 30-second run simulation` — seed 기반 missile warning 빈도; modify
  - `src/features/obstacles/obstaclePatterns.test.ts` :: pattern catalog invariants; modify
  - `tests/e2e/obstacle.spec.ts` :: warning 위치와 미사일 표시 회귀; modify only for removed full IDs from T01

#### Details

- `CHUNK_CATALOG`를 순회하는 단위 테스트를 추가해 각 일반 chunk A~E에 `warning === true && patternId === 'missile'`인 obstacle이 최소 하나 존재함을 검증한다.
- 30초 deterministic simulation(`seed=20261103`, `durationMs=30000`)의 `missileWarningCount` 하한을 기존 `1`에서 `3`으로 올린다. 이 값은 A~E 전반에 배치한 authored missile이 실제 scheduler를 통해 반복되는 최소 회귀 계약이다.
- deterministic simulation 결과에 `forced-crossfire`, `vertical-laser-full`, `horizontal-laser-full`이 절대 포함되지 않는다는 assertion을 추가한다.
- E2E obstacle 테스트는 제거된 full pattern 호출을 삭제하고, short vertical/horizontal laser와 warning missile을 각각 확인한다. warning snapshot의 x가 viewport 오른쪽 끝 근처(`> 1100`인 기존 논리 viewport 기준)이고 label이 `← 위험`인지 유지한다.
- 미사일 빈도 증가 때문에 전체 장애물 밀도가 과도하게 올라가지는 않는지, 30초 simulation의 `survived: true`와 기존 coin cluster 하한을 유지한다.

## Acceptance Criteria

- [ ] A~E 모든 정상 청크에 warning 미사일이 최소 하나씩 존재한다.
- [ ] deterministic 30초 simulation에서 missile warning count가 3 이상이고 seed 반복 결과가 동일하다.
- [ ] 미사일은 오른쪽 바깥에서 시작해 왼쪽으로 이동하며 warning indicator는 우측 끝에 표시된다.
- [ ] 미사일 추가 후 authored chunk reachability와 기존 coin/token/shield 배치 검증이 통과한다.
- [ ] 강제 즉사 패턴이나 full laser ID가 simulation 결과에 다시 나타나지 않는다.

## Validation

- `npm run test:run -- src/features/chunks src/features/playtest src/features/obstacles` — 청크 배치, deterministic frequency, warning catalog 테스트 통과
- `npm run test:e2e -- tests/e2e/obstacle.spec.ts --workers=1` — warning 위치·미사일 시각 회귀 통과

## Commit Message

```text
feat(obstacles): increase incoming missile frequency

Plan: 2026-11-06-obstacle-playability-responsive
Phase: P01-obstacle-playability-responsive
Task: T02-increase-incoming-obstacle-frequency

- add warning missiles across the normal distance chunks
- lock missile frequency and right-edge warning behavior with deterministic tests
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
