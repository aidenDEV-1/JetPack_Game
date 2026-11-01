# Task: T08 Results and Records

## Status: done ✅

## Goal

실제 장애물 충돌을 기존 `ResultsPanel`과 `RecordCoordinator`에 연결한다. 캐릭터가 몇 바퀴 구른 뒤 회색으로 쓰러지고, 그 뒤 거리·코인·점수를 저장하며, 새 최고 기록 또는 랭킹 1위이면 `멋쟁이네~`, 아니면 `재미난 친구네 ?`를 표시해야 한다.

## Decision Summary

- crash 중복 방지를 위해 `RunScene`은 crash event를 한 번만 소비하고, 결과 payload는 충돌 직전의 immutable snapshot으로 만든다.
- 저장 실패는 결과 화면을 막지 않고 pending/retry 상태로 표시한다. 성공 시 API의 `isNewBest`와 leaderboard rank를 사용해 메시지를 결정한다.

## Implementation

### I01. RunScene 종료 이벤트

- Related Files:
  - `src/game/scenes/RunScene.ts` :: `handleCrash`, `restartRun`, `onRunEnd` — crash animation와 bridge 연결; modify
  - `src/features/results/ResultsController.ts` :: crash/result phases — reset/replay 지원; modify
  - `src/features/records/recordTypes.ts` :: `GameRunResult` — token/shield는 저장하지 않고 거리/coin/score 유지; read/modify if needed

#### Details

- `ObstacleField.onHit('crash')`는 `GameState.crash()` 후 `await player.crash()`를 호출하고, `ResultsController`가 `crash-animation`에서 `results`로 전환된 뒤 `bridge.onRunEnd(snapshot)`를 한 번만 호출한다.
- `score`는 서버 계약을 깨지 않게 `Math.floor(distanceMeters) + runCoins * 10`으로 계산한다. 부스터·토큰·방어막은 gameplay state로만 사용하고 기존 API schema에는 추가하지 않는다.
- `restartRun()`은 field/controller/player/background를 reset한 뒤 start overlay에서 다시 시작할 수 있게 한다. crash 중에는 pause/resume와 추가 수집을 막는다.

### I02. GameShell 결과 상태와 저장

- Related Files:
  - `src/app/GameShell.tsx` :: `RecordCoordinator`, result view model, replay/leaderboard actions — modify
  - `src/features/results/ResultsPanel.tsx` :: result message/pending state — modify if needed
  - `src/features/results/resultMessages.ts` :: exact Korean messages — verify/modify
  - `src/features/leaderboard/LeaderboardPanel.tsx` :: saved leaderboard display — existing component integration; modify if needed

#### Details

- `onRunEnd`에서 `RecordCoordinator.save(result)`를 시작하고, 저장 중에는 결과 패널의 `savePending`을 true로 둔다. saved response의 `record.bestDistanceMeters`, `response.isNewBest`, `leaderboard.top10/currentUser`로 `isNewBest`/`isRankOne`을 계산한다.
- `getResultMessage`는 `isNewBest || isRankOne`이면 정확히 `멋쟁이네~`, 아니면 `재미난 친구네 ?`를 반환한다. 기존 테스트가 다른 문구를 기대하면 이 요구로 갱신한다.
- replay는 결과 패널을 닫고 `RunScene.restartRun()`을 호출하며, leaderboard는 saved state가 있을 때만 표시한다. 저장 실패 시 retry 버튼을 누르면 같은 `lastResult`로 재시도한다.

### I03. 결과/저장 테스트

- Related Files:
  - `src/features/results/resultMessages.test.ts` — new/modify
  - `src/app/GameShell` 관련 테스트 또는 `tests/e2e/results.spec.ts` — result save/retry/message; new
  - `src/features/records/RecordCoordinator.test.ts` — save state integration; modify if needed

#### Details

- 새 기록, 기존 기록, leaderboard rank 1, 저장 실패 후 retry를 각각 검증한다.
- crash animation이 끝나기 전에는 결과 panel이 보이지 않고, 결과가 한 번만 저장되는지 검증한다.

## Acceptance Criteria

- [ ] 충돌 시 캐릭터가 회전 후 쓰러지고 회색 tint가 적용된다.
- [ ] 충돌 결과가 거리·코인·점수로 API에 한 번만 저장된다.
- [ ] 새 최고 기록 또는 랭킹 1위에서 `멋쟁이네~`가 보인다.
- [ ] 그 외 결과에서는 `재미난 친구네 ?`가 보인다.
- [ ] 저장 실패 시 결과 화면과 재시도 버튼이 유지된다.

## Validation

- `npm run test:run -- src/features/results src/features/records` — message/save state tests 통과
- `npm run typecheck` — GameShell result callbacks 타입 오류 없음
- `npm run test:e2e -- --grep "result|record|crash"` — 충돌부터 결과 panel까지 확인

## Commit Message

```text
feat(results): connect crashes to saved run results

Plan: 2026-11-01-5pm-rush-playable-content
Phase: P03-results-and-regression
Task: T08-results-and-records

- show crash animation and outcome-specific result messages
- persist one run result and support pending save retry
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: feat(results): connect crashes to saved run results

