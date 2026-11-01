# Task: T11 Records and Leaderboard

## Status: pending

## Goal
게임 종료 결과를 Azure API에 저장하고, 결과 화면에서 TOP 10과 현재 사용자 순위를 표시한다.

## Decision Summary
- 모든 플레이의 코인은 누적하고, 최고 거리·최고 기록의 코인은 플레이어별 한 건만 유지한다.
- 결과 화면 진입 시 저장 후 랭킹을 한 번 조회하며, 저장 실패는 현재 결과 화면에서 재시도한다.

## Implementation

### I01. API client and record flow
- Related Files:
  - `src/services/api/gameRecordsApi.ts` — typed fetch calls; new
  - `src/features/records/RecordCoordinator.ts` — save/retry state; new
  - `src/features/records/recordTypes.ts` — client DTOs; new

#### Details
- **API**:
  ```typescript
  export interface GameRunResult { distanceMeters: number; runCoins: number; score: number; }
  export interface RecordCoordinator { save(result: GameRunResult): Promise<SaveState>; retry(): Promise<SaveState>; }
  ```
- POST `/api/runs` once after crash sequence. On success, GET `/api/leaderboard` once.
- On network failure keep `pending` in React state only; no local storage and no offline queue.
- Abort duplicate saves while one request is in flight.

### I02. Leaderboard display
- Related Files:
  - `src/features/leaderboard/LeaderboardPanel.tsx` — TOP 10/current rank; new
  - `src/features/leaderboard/leaderboardSort.ts` — deterministic display sorting; new
  - `src/features/leaderboard/__tests__/leaderboardSort.test.ts` — tests; new

#### Details
- Display display name, distance, and best-run coins. Do not display email, employee id, or tenant id.
- Show TOP 10 and current user row even when outside TOP 10.
- Tie-break visually and in client fallback by earlier `achievedAt`.

## Acceptance Criteria
- [ ] Every completed run sends one save request and adds run coins on the server.
- [ ] Result screen shows latest TOP 10 and current rank after save.
- [ ] Failed save shows retry control and does not use local storage.
- [ ] Only Entra display name and game metrics appear in public ranking UI.

## Validation
- `npm run test:run -- src/features/records src/features/leaderboard` — save state and sorting tests pass.
- Browser network test verifies one save and one leaderboard request per result entry.

## Commit Message
```text
feat(records): connect results to Cosmos leaderboard

Plan: 2026-11-01-dex-escape-5pm-rush
Phase: P03-content-and-ui
Task: T11-records-and-leaderboard

- save cumulative coins and best run after crash
- display top ten and current organization rank with retry state
```

## Progress
- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
