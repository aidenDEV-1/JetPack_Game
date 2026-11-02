# Task: T15 F 디버그 오버레이와 결정적 플레이 시뮬레이션

## Status: pending

## Goal

F 키로 현재 속도·활성 청크 ID·분당 코인·장애물 밀도·부스터 phase를 표시하는 개발 전용 오버레이를 켜고, seed 고정 시뮬레이션으로 첫 30초 체험 기준을 자동 검증한다. production bundle에는 오버레이와 테스트 hook이 포함되지 않아야 한다.

## Decision Summary

- F 오버레이와 deterministic simulation은 `import.meta.env.DEV`에서만 활성화한다.
- 실제 플레이 로직과 시뮬레이션 로직은 동일한 chunk/progression API를 사용하고, 시뮬레이션 전용 분기에서 결과를 조작하지 않는다.

## Implementation

### I01. Debug overlay

- Related Files:
  - `src/game/input/KeyboardController.ts` :: debug toggle; modify
  - `src/game/test/GameTestApi.ts` :: debug snapshot; modify
  - `src/features/debug/RunDebugOverlay.tsx` or Phaser debug object :: `RunDebugSnapshot`; new
  - `src/game/scenes/RunScene.ts` :: metrics collection; modify

#### Details

```typescript
export interface RunDebugSnapshot {
  speedPxPerSecond: number;
  activeChunkId: string | null;
  coinsPerMinute: number;
  obstacleDensityPerMinute: number;
  boosterPhase: string;
}

public toggleDebugOverlay(): boolean;
public getDebugSnapshot(): RunDebugSnapshot;
```

- F는 `JustDown`으로 toggle하고 기본값은 false다.
- metrics는 최근 60초 rolling window 또는 run elapsed time으로 계산하며 0으로 나누지 않는다.
- overlay는 gameplay HUD와 겹치지 않는 dev-only layer로 렌더링한다.

### I02. Seed simulation

- Related Files:
  - `src/features/playtest/DeterministicRunSimulator.ts` :: `simulate`; new
  - `src/features/playtest/__tests__/DeterministicRunSimulator.test.ts`; new
  - `src/features/chunks/ChunkScheduler.ts` :: seeded random; read-only/modify
  - `tests/e2e/playable-run.spec.ts` :: debug metrics; modify

#### Details

```typescript
export interface SimulationResult {
  durationMs: number;
  distanceMeters: number;
  obstacleKinds: readonly string[];
  coinClusterCount: number;
  missileWarningCount: number;
  survived: boolean;
}

export function simulateRun(seed: number, durationMs: number): SimulationResult;
```

- `durationMs=30000` 기본 검증에서 장애물 3종·코인 cluster 4개·missile warning 1회 이상을 확인한다.
- 동일 seed는 동일 결과, 다른 seed는 결과가 다를 수 있다.
- simulator가 API를 직접 조작해 coin/distance를 올리지 않도록 실제 scheduler/physics pure function을 호출한다.

## Acceptance Criteria

- [ ] F로 debug overlay를 켜고 끌 수 있다.
- [ ] overlay에 speed, chunk, coins/min, obstacle density, booster phase가 표시된다.
- [ ] seed 고정 30초 simulation이 기준을 통과한다.
- [ ] production build에서 F overlay와 `window.__5PM_RUSH_TEST_API__`가 노출되지 않는다.

## Validation

- `git pull --ff-only origin main`
- `npm run typecheck && npm run lint`
- `npm run test:run -- src/features/playtest src/features/chunks`
- `npm run test:e2e -- tests/e2e/production-guard.spec.ts tests/e2e/playable-run.spec.ts --workers=1`

## Commit Message

```text
test(playtest): add dev metrics and deterministic 30-second simulation

Plan: 2026-11-03-5pm-rush-game-feel
Phase: P08-playtest-and-regression
Task: T15-debug-overlay-and-simulation

- Add F-key development metrics without production exposure
- Verify the 30-second gameplay density contract with seeded runs
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
