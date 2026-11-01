# Task: T08 Background Speed and Spawn

## Status: pending

## Goal
거리 기반 무한 횡스크롤, 1,000m별 5개 배경 구간, 15% 속도 증가와 5,000m 최대 속도를 구현한다.

## Decision Summary
- 플레이어는 좌측에 고정되고 배경·장애물·아이템이 오른쪽에서 왼쪽으로 이동한다.
- 배경은 0/1,000/2,000/3,000/4,000m 구간에서 바뀌며 4,000m 이후 야간 하늘·옥상 구간을 유지한다.

## Implementation

### I01. Distance progression and speed
- Related Files:
  - `src/features/progression/progressionConfig.ts` — speed/background data; new
  - `src/features/progression/DistanceProgression.ts` — distance and speed; new
  - `src/features/progression/__tests__/DistanceProgression.test.ts` — tests; new

#### Details
- **API**:
  ```typescript
  export interface ProgressionSnapshot { distanceMeters: number; speedMultiplier: number; segmentIndex: number; }
  export function getProgression(distanceMeters: number): ProgressionSnapshot;
  ```
- Start with speed multiplier `1.0`; every completed 1,000m multiply by `1.15`; cap at the value for 5,000m.
- Distance is advanced from world speed and delta time only while `RunPhase='running'`.

### I02. Background loop
- Related Files:
  - `src/features/background/BackgroundController.ts` — parallax and segment switch; new
  - `src/content/backgroundSegments.ts` — five segment definitions; new
  - `src/features/background/backgroundLayers.ts` — repeating layer metadata; new

#### Details
- Segment definitions: office/corridor, security gate/parking, city skyscrapers, subway entry/interior/exit, night sky/rooftop.
- Each layer has repeat width, scroll factor, tint, and asset keys. Reset sprite x positions when a tile exits the left edge.
- Change style on segment boundary without resetting distance or player state.

## Acceptance Criteria
- [ ] Background scrolls continuously right-to-left with no visible seam.
- [ ] The five requested themes switch at exact 1,000m boundaries.
- [ ] Speed is perceptibly higher in each first five segments and capped after 5,000m.
- [ ] Spawner receives the current speed and segment index.

## Validation
- `npm run test:run -- src/features/progression` — boundary and cap tests pass.
- 6,000m manual run confirms five transitions and no scroll seam.

## Commit Message
```text
feat(progression): add distance speed and five background segments

Plan: 2026-11-01-dex-escape-5pm-rush
Phase: P02-gameplay-core
Task: T08-background-speed-and-spawn

- add 1000m segment progression and capped 15 percent speed ramp
- add seamless parallax background controller for five themes
```

## Progress
- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
