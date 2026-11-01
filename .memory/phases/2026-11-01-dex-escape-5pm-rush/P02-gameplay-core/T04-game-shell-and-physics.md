# Task: T04 Game Shell and Physics

## Status: done

## Goal
16:9 Phaser 게임 캔버스에 스페이스바 상승·중력 하강·거리 누적·상한 반발·바닥 달리기·일시정지 상태를 구현한다.

## Decision Summary
- 플레이어는 좌측 영역에 고정되고 세계가 오른쪽에서 왼쪽으로 이동한다.
- 위 경계는 충돌이 아닌 반발, 아래는 달리기 가능한 바닥, PC 키보드만 지원한다.

## Implementation

### I01. Game state and configuration
- Related Files:
  - `src/game/config/gameConfig.ts` — canvas and physics constants; new
  - `src/game/state/GameState.ts` — state machine; new
  - `src/game/scenes/RunScene.ts` — main scene; new

#### Details
- **Types**:
  ```typescript
  export type RunPhase = 'ready' | 'countdown' | 'running' | 'paused' | 'crashed' | 'results';
  export interface RunState { phase: RunPhase; distanceMeters: number; runCoins: number; tokenCount: number; speed: number; }
  ```
- Use fixed logical canvas `1280x720`, scale mode `FIT`, centered alignment, and CSS letterboxing.
- Physics values are data-driven: gravity, lift acceleration, max upward velocity, floor y, ceiling y, player x, and base speed live in `gameConfig.ts`.

### I02. Input and boundary behavior
- Related Files:
  - `src/game/input/KeyboardController.ts` — Space key state; new
  - `src/game/systems/RunMotionSystem.ts` — vertical movement; new
  - `src/game/systems/PauseSystem.ts` — pause/resume and focus events; new

#### Details
1. Space down applies upward acceleration; space up applies gravity.
2. Clamp player y at the ceiling and apply a small downward bounce impulse; do not emit collision/game-over.
3. At floor y, set `grounded=true`, stop jetpack thrust, and expose `running` animation state.
4. `P` is not a pause shortcut; only settings UI and focus-loss events pause.
5. On resume, keep Phaser time stopped until a `3,2,1` countdown finishes.

## Acceptance Criteria
- [ ] Space hold/ release produces smooth ascent/descent.
- [ ] Ceiling bounce never ends the run.
- [ ] Floor contact switches to running animation state and allows takeoff.
- [ ] Distance increments only during running state.
- [ ] Pause freezes physics, timers, spawns, and audio clock.

## Validation
- `npm run test:run -- src/game/systems` — motion and pause unit tests pass.
- Manual Chrome/Edge test at 1280x720 and a smaller 16:9 viewport.

## Commit Message
```text
feat(game): add Phaser run shell and flight physics

Plan: 2026-11-01-dex-escape-5pm-rush
Phase: P02-gameplay-core
Task: T04-game-shell-and-physics

- add fixed 16:9 Phaser scene and run state machine
- implement space flight, ceiling bounce, floor running, and pause state
```

## Progress
- [x] 구현 완료
- [x] 검증 통과
- commit: pending
