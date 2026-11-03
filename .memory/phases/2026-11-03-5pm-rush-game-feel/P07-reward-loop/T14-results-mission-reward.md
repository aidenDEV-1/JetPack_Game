# Task: T14 결과 화면 미션 보너스와 기록 연결

## Status: done

## Goal

결과 화면에서 3개 미션의 진행·완료 상태·보너스 코인을 표시하고, 기존 `RecordCoordinator` 저장 흐름을 통해 합산 코인이 기록되게 한다. 최고 기록/랭킹 메시지와 미션 메시지가 서로 덮어쓰지 않아야 한다.

## Decision Summary

- 결과 UI는 React `ResultsPanel`에서 담당하고 Phaser는 final run snapshot만 전달한다.
- 저장 실패·재시도·랭킹 조회 흐름은 보존하며, 미션 UI 오류가 기록 저장을 막지 않도록 한다.

## Implementation

### I01. Result data contract

- Related Files:
  - `src/features/records/recordTypes.ts` :: `GameRunResult`; modify
  - `src/game/state/GameState.ts` :: final mission fields; modify
  - `src/app/GameShell.tsx` :: `toGameRunResult`, result view model; modify
  - `src/features/results/ResultsPanel.tsx` :: props and render; modify

#### Details

```typescript
export interface GameRunResult {
  distanceMeters: number;
  runCoins: number;
  missionBonusCoins: number;
  totalRunCoins: number;
  score: number;
}
```

- `totalRunCoins = runCoins + missionBonusCoins`를 저장 payload의 기존 `runCoins` 의미에 맞게 적용한다. API 타입이 필드명을 고정한다면 coordinator 내부에서 매핑하고 외부 DTO는 기존 shape를 유지한다.
- score 계산 규칙은 기존 거리+코인 기반을 유지하되, 보너스 코인을 포함하는 기준을 문서화하고 테스트한다.
- `ResultsPanel`은 각 mission의 `label`, `progress/target`, `completed`, bonus를 표시한다.

### I02. UI and save regression

- Related Files:
  - `src/features/results/ResultsPanel.tsx` :: mission list; modify
  - `src/styles/tokens.css` 및 관련 스타일 파일 — arcade mission card; modify
  - `src/features/results/resultMessages.ts` :: existing messages; read-only
  - `src/features/records/RecordCoordinator.ts` :: save/retry idempotency; modify only if needed

#### Details

- mission card는 결과의 거리/코인 grid와 분리하고, 완료 미션은 check/gold, 미완료는 progress bar로 표시한다.
- “멋쟁이네~”/“재미난 친구네 ?” 조건은 기존 new best/rank one 계산을 변경하지 않는다.
- save pending/error 상태에서도 mission summary는 렌더링된다.

### I03. Tests and screenshots

- Related Files:
  - `src/features/results/ResultsPanel.test.tsx`; new
  - `src/features/records/RecordCoordinator.test.ts` — bonus coin/idempotency; modify
  - `tests/e2e/results.spec.ts` — mission result and retry; modify
  - `screenshots/T14/` — completed/partial mission result; new

## Acceptance Criteria

- [ ] 결과 화면에 런당 3개 미션과 각각의 진행·완료 상태가 보인다.
- [ ] 완료 미션 보너스가 총 코인과 기존 저장 결과에 반영된다.
- [ ] 저장 실패 후 재시도에서 보너스가 중복 합산되지 않는다.
- [ ] 기존 최고 기록·랭킹·결과 문구가 유지된다.

## Validation

- `git pull --ff-only origin main`
- `npm run typecheck && npm run lint`
- `npm run test:run -- src/features/results src/features/records`
- `npm run test:e2e -- tests/e2e/results.spec.ts tests/e2e/playable-run.spec.ts --workers=1`

## Commit Message

```text
feat(results): show mission progress and reward bonus

Plan: 2026-11-03-5pm-rush-game-feel
Phase: P07-reward-loop
Task: T14-results-mission-reward

- Render three mission results with completion bonuses
- Preserve idempotent save, retry, best-record, and leaderboard behavior
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: pending (to be recorded after commit)
