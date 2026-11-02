# Task: T02 Player Animation State Machine

## Status: done ✅

## Goal

현재 `RunScene.update()`의 `flight.active ? 'boosting' : ...` 분기 때문에 공중에서도 running row가 반복되거나 부스터 상태가 몸체 애니메이션을 덮어쓰는 문제를 제거한다. 고정된 frame row를 실제 지면/상승/하강/착지/충돌 상태에 연결해 비행 중에는 FLY 또는 FALL만 재생하고 상태 전환 때 캐릭터 중심점과 크기가 흔들리지 않게 한다.

## Decision Summary

- body animation 상태는 `running | takeoff | flying | falling | landing | hit | dead` 7개로 분리하고, `boosting`은 body animation이 아니라 제트팩/비행 시스템의 독립 boolean으로 유지한다.
- 모든 상태는 4-frame row를 사용한다. TAKEOFF/LAND/HIT는 one-shot, RUN/FLY/FALL은 loop, DEAD는 마지막 frame hold이며 상태 전환은 `PlayerEntity`/controller가 소유한다.

## Implementation

### I01. 상태 타입과 frame range 계약

- Related Files:
  - `src/features/player/playerTypes.ts` :: `PlayerAnimation`, `PlayerVisualState`; modify
  - `src/features/player/playerAssetConfig.ts` :: `PLAYER_ANIMATION_KEYS`, `PLAYER_ANIMATION_RANGES`; modify
  - `src/game/scenes/BootScene.ts` :: `createPlayerAnimations`; modify
  - `src/content/assets/gameAssets.ts` :: player frame metadata; read-only after T01 unless type contract requires a shared constant

#### Details

- **Signatures & Types**:
  ```typescript
  export type PlayerAnimation = 'running' | 'takeoff' | 'flying' | 'falling' | 'landing' | 'hit' | 'dead';

  export interface PlayerVisualState {
    animation: PlayerAnimation;
    boosting: boolean;
    gray: boolean;
  }

  export interface PlayerMotionVisualInput {
    grounded: boolean;
    thrusting: boolean;
    boosterActive: boolean;
    deltaMs: number;
  }

  export const PLAYER_ANIMATION_RANGES: Record<PlayerAnimation, {
    start: number;
    end: number;
    frameRate: number;
    repeat: number;
  }>;
  ```
- frame range는 반드시 아래와 같다.
  - `running`: 0–3, loop, 10 fps
  - `takeoff`: 4–7, one-shot, 14 fps
  - `flying`: 8–11, loop, 12 fps
  - `falling`: 12–15, loop, 10 fps
  - `landing`: 16–19, one-shot, 14 fps
  - `hit`: 20–23, one-shot, 10 fps
  - `dead`: 24–27, 마지막 frame hold 또는 4-frame one-shot 후 frame 27 hold
- `BootScene.createPlayerAnimations()`는 `PLAYER_ANIMATION_RANGES`를 순회해 `player-running`, `player-takeoff`, `player-flying`, `player-falling`, `player-landing`, `player-hit`, `player-dead`만 생성한다. 이전 `player-boosting`, `player-crashing`, `player-fallen` 이름을 새 runtime에서 계속 호출하지 않는다.
- 각 state row가 없는 경우 다른 row로 fallback하지 않는다. `frameStart + 4 <= gameAssetDefinitions.player.frameCount` 검사가 실패하면 build/test에서 발견되도록 한다.

### I02. 전환 controller와 PlayerEntity API

- Related Files:
  - `src/features/player/playerAnimations.ts` :: `PlayerAnimationController`; modify
  - `src/features/player/PlayerEntity.ts` :: `setAnimation`, `setBoosting`, `crash`, new `updateMotionAnimation`; modify
  - `src/features/player/__tests__/PlayerEntity.test.ts` :: state transition tests; modify

#### Details

- **Signatures & Types**:
  ```typescript
  export class PlayerAnimationController {
    public snapshot(): PlayerVisualState;
    public updateMotion(input: PlayerMotionVisualInput): PlayerAnimation;
    public setAnimation(animation: PlayerAnimation): void;
    public setBoosting(boosting: boolean): void;
    public beginCrash(): boolean;
    public finishCrash(): void;
    public reset(): void;
  }

  export class PlayerEntity extends Phaser.GameObjects.Container {
    public updateMotionAnimation(input: PlayerMotionVisualInput): void;
    public setAnimation(state: PlayerAnimation): void;
    public setBoosting(value: boolean): void;
  }
  ```
- **State transition rules**:
  1. `dead` 또는 `hit` 종료 중에는 일반 motion input이 상태를 덮어쓰지 않는다.
  2. 지면에서 thrust가 시작되거나 초기/재발동 부스터가 활성화되면 `takeoff`를 최소 120ms 재생한 뒤 공중이면 `flying`으로 전환한다.
  3. 공중이고 `thrusting === true` 또는 부스터가 활성이면 `flying`을 loop한다. 이 상태에서는 `running` frame을 절대 호출하지 않는다.
  4. 공중이고 thrust가 해제되며 부스터도 비활성이면 `falling`을 loop한다.
  5. `grounded === true`가 false→true로 바뀌면 `landing`을 one-shot으로 재생하고 120ms 이후 `running`으로 전환한다. 이미 지면에 있으면 `running`을 loop한다.
  6. 충돌 시 `beginCrash()`가 `hit`을 one-shot으로 시작하고, 기존 1080°/1200ms crash tween이 끝나면 `finishCrash()`가 `dead`와 gray tint를 설정한다.
  7. `setBoosting()`은 `PlayerVisualState.boosting`과 `JetpackAttachment`만 바꾸고 body animation을 `boosting`으로 바꾸지 않는다.
- 상태 전환 시 모든 frame의 셀 크기/anchor는 T01의 384×170 기준을 사용하며 `sprite.setScale(PLAYER_SPRITE_SCALE)`를 재설정하지 않는다. animation key 변경만으로 위치/크기가 바뀌지 않아야 한다.
- `RunScene.update()`는 기존 `updateRunMotion()` 결과와 keyboard thrust를 사용해 `player.updateMotionAnimation({ grounded: motion.grounded, thrusting: keyboard.isThrusting(), boosterActive: flight.active, deltaMs: delta })`를 호출한다. 기존의 `flight.active ? 'boosting' : ...` 직접 ternary를 제거한다.

### I03. 상태 회귀 테스트

- Related Files:
  - `src/features/player/__tests__/PlayerEntity.test.ts` :: controller transition tests; modify
  - `src/game/state/GameState.test.ts` :: run phase compatibility; read-only unless snapshot API changes require a narrow assertion
  - `tests/e2e/booster.spec.ts` :: booster-active body state; modify
  - `tests/e2e/playable-run.spec.ts` :: normal movement/flight/crash regression; modify if selector or snapshot contract changes

#### Details

- unit test sequence: `running → takeoff → flying`, `flying → falling`, `falling → landing → running`, `running/flying → hit → dead`; 각 단계에서 snapshot animation을 정확히 확인한다.
- `setBoosting(true)`를 running 상태에서 호출해도 animation이 `boosting`이라는 존재하지 않는 state로 변하지 않고, motion input이 다음 frame에서 takeoff/flying으로 결정되는지 검증한다.
- `finishCrash()` 후 `setAnimation('running')`/`updateMotion`을 호출해도 dead/gray가 유지되는 기존 불변성을 보존한다.
- E2E는 player visual snapshot에 현재 body animation과 `spriteFrame`을 노출하고, 부스터 화면에서 `animation !== 'running'`을 확인한다.

## Acceptance Criteria

- [ ] 7개 상태가 서로 다른 frame row를 사용하고 missing row fallback이 없다.
- [ ] 공중 제트팩 사용 중 body가 RUN row를 재생하지 않는다.
- [ ] TAKEOFF/LAND/HIT one-shot 전환 후 중심점·scale·collision bounds가 흔들리지 않는다.
- [ ] crash 후 기존 회색 DEAD 결과 화면과 기록 저장 흐름이 유지된다.

## Validation

- `npm run typecheck` — 새 PlayerAnimation union과 RunScene 호출 타입 통과.
- `npm run test:run -- src/features/player/__tests__/PlayerEntity.test.ts src/game/systems/RunMotionSystem.test.ts` — 상태/물리 경계 통과.
- `VITE_ENABLE_DEV_MOCK_AUTH=true npx playwright test tests/e2e/booster.spec.ts tests/e2e/playable-run.spec.ts --workers=1` — 실제 FLY/FALL/충돌 흐름 통과.
- `npm run lint` — stale animation key/unused import 없음.

## Commit Message

```text
feat(player): separate arcade animation states

Plan: 2026-11-02-5pm-rush-jetpack-visual-polish
Phase: P01-arcade-visual-polish
Task: T02-player-animation-state-machine

- map seven explicit player states to dedicated frame rows
- keep booster status independent from body animation
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: pending
