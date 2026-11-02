# Task: T02 영역별 튜닝 파일과 중복 상수 단일화

## Status: pending

## Goal

게임 수치의 단일 출처를 `src/game/config/tuning/`에 만들고, 현재 코드의 중복된 기본 속도·부스터 지속시간·생성 간격·천장/바닥 오프셋을 해당 튜닝 파일에서 읽도록 바꾼다. 수치를 바꾸지 않아도 기존 동작과 테스트 결과가 동일해야 한다.

## Decision Summary

- 튜닝 파일은 기능별로 분리하지만, 실제 소비자는 기존 도메인 폴더에 남긴다.
- Scene·Field에는 새 숫자 리터럴을 추가하지 않으며, 현재 수치는 상수 이동만 한다.

## Implementation

### I01. 튜닝 모듈과 타입 정의

- Related Files:
  - `src/game/config/tuning/movement.ts` :: `MOVEMENT_TUNING` — 중력·리프트·바닥/천장 여유; new
  - `src/game/config/tuning/speed.ts` :: `SPEED_TUNING` — 기본 속도와 연속 곡선 파라미터의 기반; new
  - `src/game/config/tuning/booster.ts` :: `BOOSTER_TUNING` — 초기/토큰 부스터 지속시간·단계·유예 기본값; new
  - `src/game/config/tuning/items.ts` :: `ITEM_TUNING` — 코인·토큰·방어막 거리와 패턴 밀도; new
  - `src/game/config/tuning/obstacles.ts` :: `OBSTACLE_TUNING` — 최소 간격·경고·청크 가중치의 기반; new
  - `src/game/config/tuning/background.ts` :: `BACKGROUND_TUNING` — 레이어·반복·전환; new
  - `src/game/config/tuning/rewards.ts` :: `REWARD_TUNING` — 미션 보너스 기본값; new
  - `src/game/config/tuning/audio.ts` :: `AUDIO_TUNING` — 볼륨·효과음 동시 재생 제한; new

#### Details

튜닝 모듈은 다음처럼 `as const` 객체를 export하고 함수는 두지 않는다.

```typescript
export const MOVEMENT_TUNING = {
  gravity: 1100,
  liftAcceleration: -1800,
  maxUpwardVelocity: -650,
  floorOffset: 55,
  ceilingOffset: 55,
  ceilingBounceVelocity: 120,
} as const;
```

같은 원칙으로 현재 값들을 이동한다. `BOOSTER_TUNING`은 Controller와 FlightController가 공유할 `durationMs`, `travelOutMs`, `holdMs`, `travelBackMs`, `speedMultiplier`를 포함하되, P04에서 값과 상태 의미를 변경할 수 있도록 이름을 명시한다.

### I02. 소비자 마이그레이션

- Related Files:
  - `src/game/config/gameConfig.ts` :: `GAME_CONFIG` — 공통 viewport와 플레이어 기준; modify
  - `src/features/progression/progressionConfig.ts` :: `PROGRESSION_CONFIG` — 속도 기본값 중복 제거; modify
  - `src/features/booster/BoosterController.ts` :: `BOOSTER_DURATION_MS` 제거; modify
  - `src/features/booster/BoosterFlightController.ts` :: 단계 상수 제거; modify
  - `src/features/items/collectibleSpawn.ts` :: `MIN_SHIELD_DISTANCE`, `SHIELD_COOLDOWN_DISTANCE`, `getSpawnInterval`; modify
  - `src/features/items/CollectibleField.ts` :: spawn 좌표·간격 소비; modify
  - `src/features/obstacles/ObstacleField.ts` :: spawn delay 범위; modify
  - `src/game/scenes/RunScene.ts` :: 물리 오프셋·기본 속도 소비; modify

#### Details

1. 기존 리터럴과 튜닝 값을 1:1 대조해 기본값을 보존한다.
2. `GAME_CONFIG.baseSpeed`가 필요한 기존 API는 제거하지 말고 `SPEED_TUNING.baseSpeed`를 참조하는 compatibility export로 유지하거나 모든 소비자를 단일 출처로 변경한다.
3. 타입 테스트가 직접 상수를 import하는 경우 새 경로로 갱신한다.
4. P02~P08에서 사용할 영역별 튜닝 파일을 미리 만들되, 해당 Task에서는 플레이 감각을 변경하지 않는다.

### I03. 상수 회귀 테스트

- Related Files:
  - `src/features/progression/__tests__/DistanceProgression.test.ts` — 기본 속도와 구간 기대값; modify
  - `src/features/booster/__tests__/BoosterController.test.ts` — 5000ms 기존 동작; modify if import path only
  - `src/features/booster/__tests__/BoosterFlightController.test.ts` — 1500/2000/1500 단계; modify if import path only
  - `src/features/items/collectibleSpawn.test.ts` — 거리 간격; modify if import path only

#### Details

- 수치 변경 없이 기존 테스트를 통과시킨다.
- 튜닝 객체가 외부에서 변경되지 않는지 `as const`와 snapshot/assertion으로 확인한다.
- 매직 넘버를 새로 추가하는 방식으로 테스트를 통과시키지 않는다.

## Acceptance Criteria

- [ ] `src/game/config/tuning/`에 8개 영역 튜닝 파일이 존재한다.
- [ ] 기본 속도, 부스터 단계/지속시간, 아이템 거리, 장애물 생성 간격, 이동 오프셋의 중복 상수가 제거된다.
- [ ] 수치 변경 없이 기존 단위 테스트와 E2E가 통과한다.
- [ ] 문서의 튜닝 링크가 실제 export 이름과 일치한다.

## Validation

- `git pull --ff-only origin main`
- `npm run typecheck && npm run lint`
- `npm run test:run`
- `npm run test:e2e -- --workers=1`

## Commit Message

```text
refactor(config): centralize game tuning values by domain

Plan: 2026-11-03-5pm-rush-game-feel
Phase: P01-foundation-and-tuning
Task: T02-tuning-config-consolidation

- Add domain tuning modules without changing gameplay values
- Remove duplicated speed, booster, spawn, and movement constants
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
