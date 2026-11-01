# Task: T10 Presentation and Results

## Status: done

## Goal
로그인 후 5시 정각 시작 연출과 충돌·결과 연출을 연결해 게임의 핵심 감정 흐름을 완성한다.

## Decision Summary
- 시작 연출은 약 3초이며, 4:59:59 시계에서 5:00:00으로 바뀐 뒤 알람·부스터 비행이 시작된다.
- 충돌 후 회전·쓰러짐·회색화가 끝난 다음 결과 화면을 표시한다.

## Implementation

### I01. Start sequence
- Related Files:
  - `src/features/start/StartSequence.ts` — timed sequence; new
  - `src/features/start/ClockOverlay.tsx` — wall clock overlay; new
  - `src/content/copy.ko.ts` — Korean labels and messages; new

#### Details
- **API**:
  ```typescript
  export interface StartSequence { play(): Promise<void>; cancel(): void; }
  ```
- Sequence: show company wall clock at `4:59:59`; animate to `5:00:00`; play alarm; activate initial 5-second booster; resolve into `running`.
- Do not start distance or obstacle timers before the sequence resolves.

### I02. Crash and result view
- Related Files:
  - `src/features/results/ResultsPanel.tsx` — results UI; new
  - `src/features/results/resultMessages.ts` — exact conditional copy; new
  - `src/features/results/ResultsController.ts` — transition coordination; new

#### Details
- Show distance, run coins, cumulative coins, best distance, and save status.
- Message is exactly `멋쟁이네~` when the run creates a new best or rank 1; otherwise exactly `재미난 친구네 ?`.
- Buttons: `다시 도전`, `랭킹 보기`, and `저장 재시도` only when save is pending.
- Results screen is blocked until crash animation completes.

## Acceptance Criteria
- [ ] Start sequence visually completes in about 3 seconds and begins with a 5-second booster.
- [ ] Crash animation precedes all result UI.
- [ ] Exact Korean messages match new-best/rank-one conditions.
- [ ] Save failure remains visible and retryable without losing the current result in the open page.

## Validation
- `npm run test:run -- src/features/start src/features/results` — timing and message tests pass.
- Manual run verifies clock, alarm, booster, crash, gray state, and buttons.

## Commit Message
```text
feat(presentation): add 5pm start and crash result sequences

Plan: 2026-11-01-dex-escape-5pm-rush
Phase: P03-content-and-ui
Task: T10-presentation-and-results

- add 5pm wall clock alarm and booster start sequence
- add crash animation handoff and Korean result messaging
```

## Progress
- [x] 구현 완료
- [x] 검증 통과
- commit: pending
