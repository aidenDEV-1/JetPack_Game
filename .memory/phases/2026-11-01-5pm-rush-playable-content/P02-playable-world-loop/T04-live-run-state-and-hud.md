# Task: T04 Live Run State and HUD

## Status: pending

## Goal

현재 `GameShell`에 고정된 `initialHud`를 실제 Phaser `RunScene` 상태와 연결한다. 플레이 중 거리·코인·토큰 3개 진행률·방어막·부스터 상태가 화면 HUD에 즉시 표시되어, 아이템과 부스터가 실제로 작동하는지 사용자가 확인할 수 있어야 한다.

## Decision Summary

- Phaser에서 React로 보내는 값은 immutable snapshot이며, React는 snapshot을 표시만 한다. React가 Phaser 객체를 직접 조작하지 않는다.
- 렌더링 프레임마다 React state를 갱신하지 않도록 100ms throttle 또는 값 변경 시 emit을 사용한다.

## Implementation

### I01. RunState 확장과 state mutation API

- Related Files:
  - `src/game/state/GameState.ts` :: `RunState`, `GameState` — shield/booster/snapshot mutation 추가; modify
  - `src/features/hud/hudTypes.ts` :: `HudViewModel` — booster state 표시 필드 추가; modify
  - `src/features/booster/boosterTypes.ts` :: `BoosterState` — remaining/flight phase 계약 확인; modify if needed

#### Details

- `RunState`는 다음 필드를 가진다: `phase`, `distanceMeters`, `runCoins`, `tokenCount`, `speed`, `hasShield`, `boosterActive`, `boosterRemainingMs`.
- `GameState`에 다음 public API를 추가한다.

  ```typescript
  public collectCoin(amount?: number): void;
  public collectToken(): void;
  public setShield(value: boolean): void;
  public setBooster(active: boolean, remainingMs: number): void;
  public reset(): void;
  public snapshot(): RunState;
  ```

- 음수 amount, running이 아닌 phase의 수집/거리 증가, token count 범위 외 값은 무시하거나 clamp한다. `reset()`은 ready와 모든 run counter를 초기화한다.

### I02. GameBridge와 React HUD 연결

- Related Files:
  - `src/game/PhaserGame.ts` :: `GameBridge` — state/end callback 추가; modify
  - `src/game/scenes/RunScene.ts` :: `emitSnapshot` — 업데이트 후 bridge emit; modify
  - `src/app/GameShell.tsx` :: `hud` state와 bridge callback — modify
  - `src/features/hud/GameHud.tsx` :: booster pill/progress — modify

#### Details

- `GameBridge`는 다음 callback을 가진다. 종료 payload는 T08에서 소비할 수 있도록 snapshot 기반으로 둔다.

  ```typescript
  export interface GameBridge {
    onReady: () => void;
    onStateChange: (snapshot: RunState) => void;
    onRunEnd: (snapshot: RunState) => void;
  }
  ```

- `RunScene`은 `beginRun`, item collect, booster tick, pause/resume, crash 직전에 snapshot을 emit한다. `GameShell`은 `useState<HudViewModel>(initialHud)`로 보관하고 `distanceMeters`, `runCoins`, `tokenCount`, `hasShield`, `boosterActive`, `boosterRemainingMs`, `paused`를 렌더링한다.
- HUD는 현재 아이콘/텍스트 스타일을 유지하되 booster active일 때 `BOOSTER`와 남은 초를 보여준다. paused 상태는 Phaser phase와 중복 관리하지 말고 bridge snapshot으로 동기화한다.

## Acceptance Criteria

- [ ] 화면의 거리/코인/토큰/방어막 값이 실제 게임 상태를 반영한다.
- [ ] 부스터 활성/잔여 시간이 HUD에 표시되고 종료 시 사라진다.
- [ ] 일시정지·재개 후 HUD가 stale 값으로 남지 않는다.
- [ ] React가 Phaser Scene 내부 필드를 직접 참조하지 않는다.

## Validation

- `npm run test:run -- src/game src/features/hud` — state transition tests 통과
- `npm run typecheck` — GameBridge callback 타입 일치
- `npm run test:e2e -- --grep "HUD|run"` — 시작 후 거리 증가 및 HUD 변경 확인

## Commit Message

```text
feat(hud): stream live run state from Phaser to React

Plan: 2026-11-01-5pm-rush-playable-content
Phase: P02-playable-world-loop
Task: T04-live-run-state-and-hud

- expose collectible and booster state in GameState snapshots
- replace static HUD values with throttled RunScene updates
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending

