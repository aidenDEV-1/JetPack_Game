# Task: T01 레이저 길이 축소 및 강제 즉사 패턴 제거

## Status: done

## Goal

수직·수평 레이저의 빔 및 노드가 플레이 화면 전체를 막지 않도록 모든 runtime 레이저 길이를 플레이어 높이 기준 `1.5H~2.0H`, 즉 `144px~192px`로 제한하고, 방어막 선행 조건이 없으면 통과할 수 없는 `forced-crossfire`와 full-span 레이저를 코드·청크·문서·테스트에서 제거한다.

## Decision Summary

- 레이저 span 모드는 `fixed`와 `random`만 허용한다. `full` 모드와 화면 끝까지 뻗는 패턴은 삭제한다.
- 방어막은 아이템 및 충돌 방어 기능으로 유지하지만, `requiresShield`, `forced-crossfire`, forced 청크 선택 로직은 제거한다.

## Implementation

### I01. 레이저 튜닝과 span resolver를 플레이 가능한 범위로 고정

- Related Files:
  - `src/game/config/tuning/obstacles.ts` :: `OBSTACLE_TUNING` — 레이저 길이 및 장애물 공통 수치; modify
  - `src/game/config/gameConfig.ts` :: `GAME_CONFIG.obstacleScale` — 플레이어 높이 기반 display/collision 스케일; modify
  - `src/features/obstacles/obstacleTypes.ts` :: `LaserSpanMode`, `LaserSpanSpec`, `SpawnContext` — 허용 span과 spawn 문맥 타입; modify
  - `src/features/obstacles/laserSpanResolver.ts` :: `resolveLaserGeometry`, `resolveLength` — 레이저 geometry 해석; modify
  - `src/features/obstacles/laserSpanResolver.test.ts` :: `laser span resolver` — 경계값 회귀 테스트; modify

#### Details

- `OBSTACLE_TUNING`에 다음 값을 단일 출처로 둔다.
  - `laserMinLengthPx: 144` (`PLAYER_HEIGHT * 1.5`)
  - `laserMaxLengthPx: 192` (`PLAYER_HEIGHT * 2.0`)
  - 기존 `minimumPlayableGap: 154` (`PLAYER_HEIGHT * 1.6`)는 유지한다.
- `GAME_CONFIG.obstacleScale.laserMinLength`와 `laserMaxLength`는 위 tuning 값을 참조하고, Scene·Pattern에 `144`, `192`를 직접 쓰지 않는다.
- `LaserSpanMode`는 `'fixed' | 'random'`만 허용한다. `LaserSpanSpec`의 `fullSpanChance`는 삭제한다.
- `resolveLength`는 fixed 길이를 viewport 전체 길이와 비교해 clamp하고, random 길이는 `[minLength, maxLength]` 안에서만 선택한다. `full` 분기와 full-span 확률 처리는 삭제한다.
- random spec의 `minLength`가 full viewport보다 큰 경우, `maxLength < minLength`, 누락 값, 0 이하 값은 기존처럼 명시적 오류를 발생시킨다.
- 테스트는 viewport `1280×720`에 대해 vertical/horizontal random 결과가 항상 `144~192` 범위이고 `collisionLength === length`인지 확인한다. full span을 기대하는 테스트는 삭제하고, fixed `360` 예시는 `192` 이하의 fixed 길이로 교체한다.

### I02. 장애물 패턴과 강제 즉사 경로 삭제

- Related Files:
  - `src/features/obstacles/obstaclePatterns.ts` :: `obstaclePatterns`, `RED_LASER`, `BLUE_LASER` — runtime 장애물 패턴 카탈로그; modify
  - `src/features/obstacles/ObstacleEntity.ts` :: `createHazard`, `createHitboxes`, `createNodeCircles` — 레이저 시각/충돌 geometry; modify
  - `src/features/obstacles/ObstacleSpawner.ts` :: `choosePattern` — 일반 장애물 선택; modify
  - `src/features/obstacles/ObstacleField.ts` :: `update`, `spawnChunk`, `spawn`, `reset` — 장애물 lifecycle; modify
  - `src/features/items/CollectibleField.ts` :: `CollectibleFieldEvents`, shield-ahead state — 강제 패턴 전용 선행 상태; modify
  - `src/game/scenes/RunScene.ts` :: `ObstacleField`/`CollectibleField` wiring 및 spawn context — 삭제된 강제 상태 전달부; modify
  - `src/features/obstacles/obstaclePatterns.test.ts` :: pattern/spawner assertions; modify
  - `src/features/obstacles/__tests__/ObstacleField.test.ts` :: forced pattern assertions; modify

#### Details

- `obstaclePatterns`에서 다음 ID를 삭제한다.
  - `vertical-laser-full`
  - `horizontal-laser-full`
  - `forced-crossfire`
- `vertical-laser`와 `horizontal-laser`만 random span을 사용하도록 하고, 두 패턴의 `laserSpan.minLength/maxLength`는 `GAME_CONFIG.obstacleScale`의 `144/192`를 참조한다. 노드 지름·빔 두께·충돌 도형 분리는 유지한다.
- `ObstacleEntity`에서 `forced-crossfire`의 두 레이저를 생성하는 분기, 두 줄 hitbox/node circle 계산 분기를 삭제하고, 일반 단일 레이저의 beam rectangle + emitter circle 계산만 남긴다.
- `ObstacleSpawner.choosePattern`은 shield-ahead/segment 조건 없이 `requiresShield === false`인 일반 패턴에서만 선택한다. 강제 패턴용 Set과 `canUseForcedPattern`의 호출·테스트를 제거한다.
- `ObstacleField`에서 `shieldPickupAhead`, `forcedPatternSegments`, forced crossfire 중복 방지 Set, `requiresShield` 분기를 제거한다. 청크에 남아 있는 forced spec은 조용히 무시하지 말고 T01의 청크 정리 후에는 존재하지 않도록 한다.
- `CollectibleField`의 `onShieldPickupSpawned`, `shieldPickupSpawned`, `hasShieldPickupAhead`는 강제 장애물 선행 조건 외에는 사용하지 않으므로 삭제한다. shield 생성·수집·중첩 방지(`shieldHeld`)는 유지한다.
- `SpawnContext`에서 강제 패턴에만 쓰이는 필드는 제거하고, 일반 spawn에 필요한 `distanceMeters`와 `speed`만 남긴다. `ObstaclePattern.requiresShield`, `GameChunk.requiresShield`, `ChunkObstacleSpec.forced`도 동일한 이유로 제거한다.
- 기존 충돌 결과(`ignored-by-booster`, `blocked-by-shield`, `crash`)와 방어막 소비 로직은 수정하지 않는다. 이번 변경은 강제 패턴의 삭제이지 shield 충돌 규칙의 삭제가 아니다.

### I03. 청크와 정식 설계 문서 동기화

- Related Files:
  - `src/features/chunks/chunkTypes.ts` :: `ChunkId`, `GameChunk`, `ChunkObstacleSpec` — 강제 청크 필드 제거; modify
  - `src/features/chunks/chunkCatalog.ts` :: `CHUNK_CATALOG` — F 강제 청크 및 full 레이저 spec 제거; modify
  - `src/features/chunks/chunkReachability.ts` :: `validateChunkReachability` — shield-required/forced 검증 제거, playable gap 검증 유지; modify
  - `src/features/chunks/__tests__/chunkReachability.test.ts` :: authored chunk validation; modify
  - `SPEC.md` :: 공통 장애물 제약 — 실제 규칙의 단일 문서; modify
  - `docs/game-design/09-obstacles.md` :: 장애물 설계 규칙 및 검증 명령; modify

#### Details

- `CHUNK_CATALOG`는 A~E만 유지한다. F 청크와 `forced-crossfire` 두 개의 spec을 삭제한다.
- D 청크의 `vertical-laser-full`은 `vertical-laser`로 교체하고, 해당 spec은 random span과 warning 규칙을 사용한다. full ID가 catalog에 다시 들어오지 않도록 테스트한다.
- 모든 authored chunk는 `validateChunkReachability`로 기존 `minimumPlayableGap = 154px` 이상을 만족해야 한다. 레이저 길이를 줄이는 것과 player가 지나갈 수 있는 vertical opening 검증을 혼동하지 않는다.
- `SPEC.md`의 “강제 패턴은 1100m·방어막 선행 조건” 문장을 삭제하고, “모든 일반 장애물 청크는 최소 `1.6H` 통과 간격을 보장하며 방어막은 단일 충돌을 막는 아이템”으로 갱신한다. 논리 viewport `1280×720`과 `PLAYER_HEIGHT=96px`은 유지한다고 명시한다.
- `docs/game-design/09-obstacles.md`에 fixed/random 레이저만 허용, `144~192px` span, full-span 및 forced-crossfire 없음, 미사일 warning 규칙을 기록한다.

## Acceptance Criteria

- [ ] runtime pattern catalog에 full-span 또는 `forced-crossfire` ID가 없다.
- [ ] 모든 수직·수평 레이저의 resolved beam length가 `144px~192px`이고 emitter node는 beam과 분리된 원형 collision을 유지한다.
- [ ] 방어막을 보유하지 않아도 모든 authored chunk에 `minimumPlayableGap=154px` 이상의 생존 경로가 있다.
- [ ] shield 아이템을 먹고 충돌했을 때 한 번 막히는 기존 동작과 booster invincibility가 그대로 유지된다.
- [ ] 관련 단위 테스트에서 더 이상 full/forced pattern을 기대하지 않는다.

## Validation

- `npm run test:run -- src/features/obstacles src/features/chunks` — 레이저 geometry, pattern catalog, chunk reachability 테스트 통과
- `npm run typecheck` — forced state 제거 후 타입 오류 없음
- `npm run lint` — 미사용 shield-ahead/forced 코드 없음

## Commit Message

```text
fix(obstacles): shorten lasers and remove forced death patterns

Plan: 2026-11-06-obstacle-playability-responsive
Phase: P01-obstacle-playability-responsive
Task: T01-shorten-lasers-remove-forced-death

- constrain vertical and horizontal laser spans to player-height tuning
- remove full-span and shield-required forced crossfire patterns
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: pending
