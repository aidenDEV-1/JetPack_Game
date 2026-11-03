# Task: T03 연속 속도 곡선과 비행 물리 튜닝

## Status: done

## Goal

거리 0m부터 5000m 이후까지 속도가 1000m 경계에서 점프하지 않고 연속적으로 증가하며, 상승·하강이 스페이스바 입력에 즉시 반응하도록 만든다. `03-speed-curve.png`의 제안 곡선과 `06-height.md`의 천장·바닥 규칙을 기준으로 플레이어가 시작 30초 안에 속도 상승을 체감해야 한다.

## Decision Summary

- 입력은 스페이스바 홀드만 유지한다. 마우스 입력은 추가하지 않는다.
- 높이 제한은 충돌 판정이 아니라 경계에서 부드럽게 반동/제동하는 물리로 처리하며, 모든 오프셋은 `MOVEMENT_TUNING`에서 읽는다.

## Implementation

### I01. 연속 진행 곡선

- Related Files:
  - `src/game/config/tuning/speed.ts` :: `SPEED_TUNING`, `SpeedTuning` — 거리·최대 속도·곡선 shape; modify
  - `src/features/progression/DistanceProgression.ts` :: `getProgression`, `getWorldSpeed` — 연속 speed multiplier; modify
  - `src/features/progression/__tests__/DistanceProgression.test.ts` — 경계와 단조성 검증; modify

#### Details

```typescript
export interface ProgressionSnapshot {
  distanceMeters: number;
  speedMultiplier: number;
  segmentIndex: number;
}

export function getProgression(distanceMeters: number): ProgressionSnapshot;
export function getWorldSpeed(distanceMeters: number): number;
```

- `segmentLengthMeters=1000`과 `speedIncreasePerSegment=1.15`를 더 이상 계단값으로 사용하지 않는다.
- 0m에서 기존 `baseSpeed=300`, 5000m에서 기존 5단계 최대치 `603...` 부근에 도달하도록 `smoothstep` 또는 지수 보간을 튜닝 파일에 정의한다.
- `getProgression(d)`는 finite/non-negative distance를 정규화하고, `d=999.99`, `1000`, `1000.01`에서 speed가 단조 증가하며 연속인지 테스트한다.
- `segmentIndex`는 배경·청크 풀용 정수 인덱스로 유지하고, 속도는 별도 연속값으로 계산한다.

### I02. 물리 경계와 입력 불변식

- Related Files:
  - `src/game/config/tuning/movement.ts` :: `MOVEMENT_TUNING`; modify
  - `src/game/systems/RunMotionSystem.ts` :: `updateRunMotion`; modify
  - `src/game/scenes/RunScene.ts` :: `update`; modify
  - `src/game/input/KeyboardController.ts` :: `isThrusting`; read-only unless regression requires

#### Details

- `updateRunMotion`은 다음 시그니처를 유지한다.

```typescript
export function updateRunMotion(input: RunMotionInput): RunMotionSnapshot;
```

- `floorOffset`와 `ceilingOffset`를 Scene의 `±55` 리터럴 대신 튜닝값으로 전달한다.
- 천장에 닿으면 `ceilingBounceVelocity`를 적용하되, `ceilingY` 바깥으로 누적되지 않도록 clamp한다.
- 바닥에서는 `grounded=true`, velocity를 0으로 정규화하고 스페이스바가 없을 때 RUN 상태가 된다.
- 스페이스바만 thrust source로 허용한다. `KeyboardController`의 keyup/keydown 상태와 Phaser update delta가 일관되게 처리되어야 한다.

### I03. 검증

- Related Files:
  - `src/game/systems/RunMotionSystem.test.ts` — 바닥·천장 경계; modify
  - `tests/e2e/playable-run.spec.ts` — 시작 후 30초 체감/거리 증가; modify
  - `screenshots/T03/` — 일반 비행과 거리별 HUD 캡처; new

#### Details

- speed curve snapshot을 0, 500, 999, 1000, 2000, 3000, 5000m에서 기록한다.
- 스페이스바를 누른 상태/해제 상태 각각 상승·하강이 되는지 확인한다.
- 화면 밖 클릭이나 마우스 홀드가 thrust를 만들지 않는 것을 회귀 테스트로 확인한다.

## Acceptance Criteria

- [ ] 속도는 1000m 경계에서 불연속 점프 없이 단조 증가한다.
- [ ] 기본·천장·바닥 물리의 수치가 튜닝 파일에만 있다.
- [ ] 스페이스바 외 입력이 비행을 활성화하지 않는다.
- [ ] `03-speed-curve.png`와 비교한 스크린샷에서 시작 속도와 1000m 이후 가속이 확인된다.

## Validation

- `git pull --ff-only origin main`
- `npm run typecheck && npm run lint`
- `npm run test:run -- src/features/progression src/game/systems/RunMotionSystem.test.ts`
- `npm run test:e2e -- tests/e2e/playable-run.spec.ts --workers=1`

## Commit Message

```text
feat(movement): apply continuous distance speed curve

Plan: 2026-11-03-5pm-rush-game-feel
Phase: P02-movement-and-speed
Task: T03-continuous-speed-and-motion

- Replace stepped speed jumps with a continuous progression curve
- Keep spacebar-only flight and tune floor/ceiling boundaries centrally
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: pending
