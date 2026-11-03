# Task: T04 충돌 손맛과 사망 중 거리 처리

## Status: done

## Goal

장애물 충돌 순간에 80ms 정지감을 주고, 캐릭터가 바닥에서 2회 튕긴 뒤 미끄러지며 감속하는 동안 거리 계산을 계속한 다음 결과 화면을 표시한다. 기존 충돌 결과 저장·랭킹 흐름을 유지하면서 즉시 결과 전환 문제를 제거한다.

## Decision Summary

- 충돌 결과는 여전히 `CollisionResolver`의 `crash`이며 방어막/부스터 우선순위를 바꾸지 않는다.
- 사망 애니메이션과 결과 화면 전환은 `ResultsController`가 제어하고, 이동·거리 증가를 `RunScene`이 명시적으로 관리한다.

## Implementation

### I01. Crash motion state

- Related Files:
  - `src/game/config/tuning/movement.ts` :: `crash` tuning — hit-stop·bounce·slide 값; modify
  - `src/features/player/playerTypes.ts` :: `PlayerAnimation`; modify if `crash-slide` state needed
  - `src/features/player/PlayerEntity.ts` :: `crash`; modify
  - `src/features/results/ResultsController.ts` :: crash phase; modify

#### Details

```typescript
export interface CrashMotionConfig {
  hitStopMs: number;
  bounceCount: number;
  bounceHeightPx: number;
  bounceDurationMs: number;
  slideDurationMs: number;
  slideSpeedPxPerSecond: number;
}

public crash(): Promise<void>;
```

- `PlayerEntity.crash()`는 hit-stop 동안 입력·월드 업데이트를 잠시 멈추고, 이후 `bounceCount=2`의 Tween/상태 전환을 거친다.
- 캐릭터는 바닥 아래로 내려가지 않으며 마지막에는 회색 DEAD 상태가 된다.
- 기존 `angle:1080`, `y+40` 단일 tween은 단계별 연출로 교체하되, 결과 화면이 중복 호출되지 않도록 `crashStarted` guard를 유지한다.

### I02. RunScene 결과 전환과 거리

- Related Files:
  - `src/game/scenes/RunScene.ts` :: `update`, `handleObstacleHit`; modify
  - `src/game/state/GameState.ts` :: `addDistance`, `crash`, `finishResults`; modify
  - `src/features/effects/RunEffects.ts` :: crash particles/camera shake; modify

#### Details

1. 충돌 전 `running`에서 `crashed`로 전환한 뒤, crash motion 동안 `crashMotionActive` 상태를 별도로 둔다.
2. crash slide delta를 `GameState.addDistance()`에 전달해 최종 기록에 포함한다. `crashed` 상태에서 일반 수집·장애물 업데이트는 실행하지 않는다.
3. `ResultsController.finishCrash()` 완료 시 한 번만 `onRunEnd(snapshot)`을 호출한다.
4. 기존 Cosmos 저장 DTO는 바꾸지 않는다.

### I03. Test and screenshots

- Related Files:
  - `src/features/results/resultMessages.test.ts` — 결과 메시지 regression; read-only
  - `tests/e2e/results.spec.ts` — 충돌 후 결과 시점과 거리; modify
  - `screenshots/T04/` — 충돌·바운스·결과 캡처; new

#### Details

- hit-stop 중 distance가 증가하지 않고, bounce/slide 중에는 증가하는지 단위 테스트한다.
- 결과 화면은 crash 시작 직후 표시되지 않고, 설정된 crash duration 이후 표시되어야 한다.
- retry/save failure 동작은 기존 테스트와 동일해야 한다.

## Acceptance Criteria

- [ ] 80ms hit-stop, 2회 바운스, 감속 미끄러짐이 순서대로 보인다.
- [ ] 미끄러지는 동안 증가한 거리가 최종 저장값에 포함된다.
- [ ] 결과 화면과 기록 저장 callback이 한 번만 실행된다.
- [ ] 방어막·부스터 충돌 우선순위와 기존 기록 API가 유지된다.

## Validation

- `git pull --ff-only origin main`
- `npm run typecheck && npm run lint`
- `npm run test:run -- src/features/results src/game/state src/features/obstacles`
- `npm run test:e2e -- tests/e2e/results.spec.ts --workers=1`

## Commit Message

```text
feat(feel): add hit-stop bounce and crash slide sequence

Plan: 2026-11-03-5pm-rush-game-feel
Phase: P02-movement-and-speed
Task: T04-crash-feel-and-distance

- Delay results until the player finishes the crash motion
- Count crash-slide distance while preserving record persistence
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: pending
