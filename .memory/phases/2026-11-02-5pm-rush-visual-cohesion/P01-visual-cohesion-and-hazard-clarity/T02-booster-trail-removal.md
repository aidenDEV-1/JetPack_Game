# Task: T02 Booster Trail Removal

## Status: done ✅

## Goal

부스터가 시작·토큰 3개 수집·재발동될 때 캐릭터 뒤에 남는 네모난 aura와 누적 잔상 sprite를 완전히 제거하고, 가방 배출구의 단일 불꽃만으로 속도감을 표현한다. 잔상 때문에 프레임이 겹쳐 보이거나 렌더링이 느려진 것처럼 보이는 문제를 없애는 것이 목적이다.

## Decision Summary

- `PlayerEntity`에는 부스터마다 새 trail object를 생성하지 않으며, T01의 하나의 `JetpackAttachment` 불꽃을 visibility/scale/alpha만 갱신한다.
- `BoosterFlightController`의 x축 이동·속도 multiplier·무적 시간은 변경하지 않는다. 시각 VFX 제거가 gameplay state나 충돌 판정을 건드리지 않게 한다.

## Implementation

### I01. 잔상 생성 경로 제거

- Related Files:
  - `src/features/player/PlayerEntity.ts` :: `boostTrail`, `boostAura`, `setAnimation`, `setBoosting`, `crash`, `reset` — 독립 trail/aura sprite 제거; modify
  - `src/features/player/JetpackAttachment.ts` :: `setActive`, `setGray`, `reset` — 단일 불꽃의 상태만 갱신; modify from T01
  - `src/features/booster/BoosterFlightController.ts` :: `update`, `snapshot` — 이동 state 유지 여부 확인; read-only unless VFX callback가 섞여 있으면 제거
  - `src/features/booster/BoosterFeedback.ts` :: `showBoosterFeedback` — 중앙 `BOOST!` 1회 feedback은 유지하되 지속 trail로 오인되는 tween/object가 없는지 확인; modify only if needed

#### Details

- **Signatures & Types**:

  ```typescript
  public setBoosting(value: boolean): void;
  public setAnimation(state: PlayerAnimation): void;
  public async crash(): Promise<void>;
  public reset(): void;
  ```

- **State and Object Rules**:
  - boosting on: 기존 attachment 불꽃의 `visible=true`, `alpha`와 scale을 부스터용 값으로 설정한다.
  - boosting off: attachment 불꽃을 숨기고, 이전 frame 위치에 남는 object/tween/texture copy를 만들지 않는다.
  - crash: 불꽃을 즉시 숨긴 뒤 회전·회색 쓰러짐만 실행한다. crash 완료 후 `setAnimation('fallen')`이 불꽃을 다시 켜지 않게 한다.
  - reset: Phaser tween을 중지하고 불꽃 1개를 초기 상태로 복구한다. `scene.add.sprite` 또는 `scene.add.image`가 `update()`/`setBoosting()` 호출마다 증가하지 않아야 한다.

- **Execution Flow / Logic**:
  1. Precondition & Validation: `PlayerEntity`에 trail/aura 참조가 남아 있는지, `update()` 경로에서 trail 생성이 호출되는지 검색한다. T01의 attachment가 캐릭터 Container child인지 확인한다.
  2. Core Processing: `setAnimation`과 `setBoosting`을 단일 attachment API로 연결하고, `BoosterFlightController`는 snapshot을 그대로 반환한다. `showBoosterFeedback`는 한 번 생성한 label을 650ms 뒤 destroy하는 기존 흐름만 허용한다.
  3. Error & Exception Handling: 중복 crash나 reset 중 tween 완료 callback이 stale visual state를 재활성화하지 않도록 `crashStarted` guard와 tween kill 순서를 유지한다.
  4. State Transition & Return: 부스터 시작/종료 후 `getVisualState()`는 각각 `{ boosting: true/false, gray: false }`를 반영하고, 부스터 종료 후 `BoosterFlightSnapshot`의 `playerX`와 `worldSpeedMultiplier`는 기존 값과 같다.

### I02. 성능·잔상 회귀 테스트

- Related Files:
  - `src/features/booster/__tests__/BoosterFlightController.test.ts` :: 이동·복귀·재발동 state regression — modify only if needed
  - `src/features/player/__tests__/PlayerEntity.test.ts` :: boosting/crash/reset visual state — modify
  - `tests/e2e/booster.spec.ts` :: 화면 부스터와 x축 이동 smoke test — modify
  - `tests/e2e/playable-run.spec.ts` :: 1280×720 booster screenshot/console regression — modify

#### Details

- unit test는 5초 부스터가 오른쪽 이동·hold·복귀하는 기존 결과와 boosting off 후 잔여 state가 없는 것을 유지한다.
- E2E는 `getBoosterSnapshot()`에서 `playerX > GAME_CONFIG.playerX`와 부스터 재발동을 확인하고, 결과 화면까지 console error 또는 asset request failure가 없는지 검사한다.
- screenshot은 부스터 중 단일 캐릭터/불꽃이 보이는 증거로 저장하되, 이전 프레임의 trail을 의미하는 별도 DOM/Phaser test hook이 증가하지 않는지 dev-only debug snapshot으로 확인한다.

## Acceptance Criteria

- [ ] 부스터 중 캐릭터 뒤에 잔상·네모 aura·누적 trail이 남지 않는다.
- [ ] 부스터의 속도·우측 비행·복귀·무적 시간과 토큰 3개 재발동 규칙은 그대로 동작한다.
- [ ] crash/reset/재플레이 후 불꽃 object가 중복 생성되거나 회색 fallen 상태에서 다시 켜지지 않는다.
- [ ] 부스터 실행 중 console error, `/assets/` 404, 눈에 띄는 프레임 누적이 없다.

## Validation

- `npm run test:run -- src/features/booster src/features/player` — booster/player unit tests 통과
- `npm run typecheck` — VFX 제거 후 bridge와 Phaser 타입 오류 없음
- `npx playwright test tests/e2e/booster.spec.ts tests/e2e/playable-run.spec.ts --workers=1` — 부스터 화면·재발동·콘솔/에셋 오류 통과

## Commit Message

```text
perf(booster): remove persistent booster trails

Plan: 2026-11-02-5pm-rush-visual-cohesion
Phase: P01-visual-cohesion-and-hazard-clarity
Task: T02-booster-trail-removal

- keep only the bag-mounted flame during booster flight
- prevent persistent trail objects and stale afterimage rendering
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: perf(booster): remove persistent booster trails
