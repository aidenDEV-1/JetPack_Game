# Task: T13 런당 미션과 진행 보상 모델

## Status: pending

## Goal

각 런 시작 시 3개의 미션을 생성하고, 코인 수집·미사일 회피·부스터 사용 같은 플레이 행동을 진행값으로 기록해 종료 시 보너스 코인을 계산한다. 기존 `GameRunResult`와 서버 저장 API를 깨지 않고 클라이언트 런 상태에만 미션 정보를 추가한다.

## Decision Summary

- 서버 스키마와 Cosmos DTO는 변경하지 않는다. 미션은 클라이언트에서 계산한 `runCoins + missionBonusCoins`를 기존 코인 결과로 전달한다.
- 미션 정의와 수치는 `src/game/config/tuning/rewards.ts`에만 둔다.

## Implementation

### I01. Mission model and catalog

- Related Files:
  - `src/features/rewards/missionTypes.ts` :: `MissionId`, `RunMission`, `MissionProgress`; new
  - `src/features/rewards/missionCatalog.ts` :: `MISSION_CATALOG`; new
  - `src/game/config/tuning/rewards.ts` :: targets/bonus; modify

#### Details

```typescript
export type MissionId = 'collect-coins' | 'evade-missiles' | 'activate-booster' | 'reach-distance';
export interface RunMission { id: MissionId; label: string; target: number; bonusCoins: number; progress: number; completed: boolean; }
export interface MissionSnapshot { missions: readonly RunMission[]; bonusCoins: number; }
```

- 매 런에 3개를 선택하되 seeded random을 주입하면 테스트에서 고정한다.
- 기본 예시 target: 코인 50개, 미사일 3회 회피, 부스터 2회. 실제 값은 튜닝 파일에 둔다.
- 한 미션은 완료 후 progress가 target을 초과해도 target으로 clamp하고 보너스는 한 번만 지급한다.

### I02. Progress tracker

- Related Files:
  - `src/features/rewards/MissionTracker.ts` :: `startRun`, `recordEvent`, `snapshot`; new
  - `src/game/state/GameState.ts` :: mission snapshot/reset; modify
  - `src/game/scenes/RunScene.ts` :: event emission; modify

#### Details

```typescript
export type MissionEvent =
  | { type: 'coin-collected'; amount: number }
  | { type: 'missile-evaded' }
  | { type: 'booster-activated' }
  | { type: 'distance-reached'; meters: number };

public recordEvent(event: MissionEvent): void;
public snapshot(): MissionSnapshot;
```

- coin collect, missile offscreen/evaded, booster start, distance update에서 event를 한 번만 발행한다.
- 충돌로 끝난 미사일은 evade로 세지 않는다.
- `GameState.reset()`은 mission tracker도 새 run으로 되돌리고, 결과 snapshot에는 final mission progress/bonus가 포함된다.

### I03. Unit tests

- Related Files:
  - `src/features/rewards/__tests__/MissionTracker.test.ts`; new
  - `src/game/state/GameState.test.ts`; modify

#### Details

- 정확히 target에서 completed/bonus 지급.
- target 초과 이벤트에서 중복 보너스 없음.
- reset 후 이전 런 progress 없음.
- 랜덤 선택이 seed에 따라 결정적.

## Acceptance Criteria

- [ ] 매 런 3개의 미션이 생성되고 HUD/결과에서 같은 ID를 사용한다.
- [ ] 코인·미사일 회피·부스터 이벤트가 정확히 한 번씩 반영된다.
- [ ] 미션 완료 보너스가 한 번만 계산된다.
- [ ] 기존 저장 DTO와 API endpoint는 변경하지 않는다.

## Validation

- `git pull --ff-only origin main`
- `npm run typecheck && npm run lint`
- `npm run test:run -- src/features/rewards src/game/state`

## Commit Message

```text
feat(rewards): add deterministic run mission tracking

Plan: 2026-11-03-5pm-rush-game-feel
Phase: P07-reward-loop
Task: T13-run-missions

- Define three-run mission data and tuning values
- Track gameplay events without changing the server schema
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
