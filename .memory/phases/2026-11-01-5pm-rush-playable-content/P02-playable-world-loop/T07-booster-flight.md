# Task: T07 Booster Flight

## Status: pending

## Goal

시작 직후와 DEX 토큰 3개 수집 시 발동하는 부스터를 실제 화면 이동으로 구현한다. 부스터 동안 플레이어는 왼쪽 anchor에서 오른쪽 끝까지 날아가고, 일정 시간 고속·무적 상태를 유지한 뒤 종료 직전에 왼쪽 anchor로 돌아와야 한다. 단순히 불꽃만 커지는 현재 동작을 제거한다.

## Decision Summary

- 부스터 논리 상태와 화면 x축 이동을 분리한다. `BoosterController`는 activation/token/shield 상태를, `BoosterFlightController`는 시간에 따른 flight phase와 x/world-speed multiplier를 담당한다.
- 총 5000ms를 `travel-out 1500ms → hold 2000ms → travel-back 1500ms`로 고정한다. ease는 out/in cubic을 사용해 순간이동처럼 보이지 않게 한다.

## Implementation

### I01. Flight state machine

- Related Files:
  - `src/features/booster/boosterTypes.ts` :: `BoosterState`, `BoosterFlightPhase` — phase/progress/x API; modify
  - `src/features/booster/BoosterController.ts` :: token/shield/active state — activation event와 timer 분리; modify
  - `src/features/booster/BoosterFlightController.ts` :: `BoosterFlightController` — 실제 비행 계산; new
  - `src/features/booster/__tests__/BoosterFlightController.test.ts` — timing/x/invincible tests; new

#### Details

- `BoosterFlightController` API는 다음과 같다.

  ```typescript
  export interface BoosterFlightSnapshot {
    active: boolean;
    phase: 'idle' | 'travelling-out' | 'holding' | 'travelling-back';
    playerX: number;
    worldSpeedMultiplier: number;
    remainingMs: number;
  }

  public activate(): void;
  public update(deltaMs: number): BoosterFlightSnapshot;
  public snapshot(): BoosterFlightSnapshot;
  ```

- `activate()`는 active 상태에서 재호출되면 duration을 누적하지 말고 현재 flight를 초기화한다. `playerX` 시작값은 `GAME_CONFIG.playerX`, 목표값은 `GAME_CONFIG.width - 120`, 일반 multiplier는 1, boost multiplier는 2.4로 둔다.
- `BoosterController.collectToken()`이 세 번째 token에서 activation callback을 발생시키고 `RunScene`이 flight controller를 activate한다. `beginRun()`의 initial activation도 같은 경로를 사용한다.

### I02. RunScene/PlayerEntity visual movement

- Related Files:
  - `src/game/scenes/RunScene.ts` :: booster update/order — player x, speed, invincibility 연결; modify
  - `src/features/player/PlayerEntity.ts` :: trail/aura/boosting — modify
  - `src/features/background/BackgroundController.ts` :: boost speed 입력 — T03 API 사용; modify if needed

#### Details

- 매 update 순서는 `boosterFlight.update` → `player.x = snapshot.playerX` → world speed 계산 → background/items/obstacles 이동 순서로 고정한다. 부스터 종료 시 player.x는 정확히 `GAME_CONFIG.playerX`로 snap하고 일반 movement로 전환한다.
- booster active 중 `player.setBoosting(true)`, `invincible=true`, `worldSpeed=baseSpeed * progression.speedMultiplier * 2.4`를 field들에 전달한다. HUD에는 remaining seconds를 emit한다.
- trail은 우측으로 길게 늘어나는 animated image/emitter, aura는 cyan/white ring, 화면에는 작은 `BOOST!` feedback을 사용한다. 부스터가 끝나면 aura/trail/tint가 남지 않아야 한다.
- 시작 clock/alarm 이후 즉시 부스터 flight를 시작하되, StartSequence가 완료되기 전에는 RunScene phase가 running이 되지 않도록 기존 countdown 흐름을 보존한다.

## Acceptance Criteria

- [ ] 시작 후 캐릭터가 실제로 오른쪽 끝까지 이동했다가 왼쪽 위치로 돌아온다.
- [ ] token 3개 수집 시 같은 flight가 시작된다.
- [ ] 부스터 중 충돌이 무시되고 world/background/obstacle 이동 속도가 체감되게 증가한다.
- [ ] 부스터 종료 시 player가 왼쪽 anchor에 있고, aura/trail/boost HUD가 정리된다.
- [ ] 부스터 재발동/일시정지/재개에서 남은 시간이 음수로 내려가거나 x가 틀어지지 않는다.

## Validation

- `npm run test:run -- src/features/booster` — phase timing, x interpolation, token threshold tests 통과
- `npm run typecheck` — BoosterFlightController와 RunScene callback 타입 일치
- `npm run test:e2e -- --grep "booster"` — 시작 부스터와 token-triggered booster의 화면 이동 확인

## Commit Message

```text
feat(booster): implement visible high-speed flight sequence

Plan: 2026-11-01-5pm-rush-playable-content
Phase: P02-playable-world-loop
Task: T07-booster-flight

- move the player to the right and back during booster flight
- synchronize invincibility, world speed, HUD, and boost effects
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending

