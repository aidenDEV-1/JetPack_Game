# Task: T16 최종 플레이테스트와 회귀 검증

## Status: done

## Goal

전체 게임 루프에서 인증·시작·인트로·일반 비행·청크·아이템·부스터·사망·미션·기록·랭킹이 함께 작동하는지 확인하고, 거리 구간별 결과 스크린샷과 성능/에셋/접근성 진단을 남긴다.

## Decision Summary

- 이 Task는 기능을 추가하지 않고 P01~P07의 완료 기준을 통합 검증한다.
- staging Entra ID와 local mock auth 테스트를 구분하며, 실제 계정/기록을 테스트 데이터로 오염시키지 않는다.

## Implementation

### I01. E2E scenario matrix

- Related Files:
  - `tests/e2e/auth.spec.ts` — login gate/mock login; read-only/modify
  - `tests/e2e/playable-run.spec.ts` — 30초 playable loop; modify
  - `tests/e2e/booster.spec.ts` — intro, attached booster, grace; modify
  - `tests/e2e/collectible.spec.ts` — coin/token/shield and missions; modify
  - `tests/e2e/obstacle.spec.ts` — chunks, warning missile, laser; modify
  - `tests/e2e/results.spec.ts` — crash slide, mission bonus, save retry; modify
  - `tests/e2e/production-guard.spec.ts` — dev-only guard; modify

#### Details

각 시나리오에서 다음을 명시적으로 확인한다.

- 로그인하지 않으면 게임 게이트가 보이고 mock login 후에만 시작 버튼이 보인다.
- 시작 버튼 후 5시 시계·알람·인트로를 거쳐 짧은 부스터와 일반 비행으로 전환된다.
- 30초 동안 장애물 3종, 코인 묶음 4개, 미사일 warning/launch, DEX token, shield를 확인한다.
- 부스터는 화면에 플레이어가 하나만 보이고, 가방에서 불꽃이 나며, 종료 grace가 적용된다.
- 충돌은 hit-stop→2회 bounce→slide 후 결과를 띄우고 slide 거리와 mission bonus를 저장한다.
- 저장 실패·재시도·랭킹 응답에서 중복 저장이 없다.

### I02. Screenshot and visual checklist

- Related Files:
  - `screenshots/T16/0m-start.png`, `1000m-security.png`, `2000m-city.png`, `3000m-subway-entrance.png`, `3500m-subway-inside.png`, `4000m-rooftop.png`; new
  - `docs/reference/game-feel/*.png` — visual comparison; read-only

#### Details

- 1280×720 viewport로 캡처한다.
- 체크 항목: 캐릭터 사각형/잔상 없음, 플레이어 단일 렌더, 장애물 대비, 코인 패턴, background seam, floorY 정렬, HUD overlap, NPC non-collision, audio status.
- 각 캡처의 seed/distance/phase를 파일 옆 metadata JSON 또는 테스트 로그에 남긴다.

### I03. Full quality gate

- Related Files:
  - `README.md` — local test and screenshot instructions; modify
  - `SPEC.md` — final links/status; modify
  - `.memory/phases/.../phase.md` — all task statuses; modify after implementation only

#### Details

- asset validation, typecheck, lint, unit, E2E를 순서대로 실행한다.
- Vite production build에서 오디오·참고 이미지·dev hook이 의도대로 분리되는지 확인한다.
- 실패 시 원인을 해당 Task로 되돌려 수정하고, 검증만 통과시키기 위한 테스트 skip/timeout 증가는 금지한다.

## Acceptance Criteria

- [ ] 전체 local E2E와 관련 단위 테스트가 통과한다.
- [ ] 0~4000m 구간 스크린샷과 참고 이미지 비교 결과가 남는다.
- [ ] production bundle에 mock auth/test hook/debug overlay가 없다.
- [ ] 접근 가능한 버튼 label·pause/mute·결과 재시도 흐름이 유지된다.
- [ ] 최종 README/SPEC와 `.memory` phase 상태가 실제 구현과 일치한다.

## Validation

- `git pull --ff-only origin main`
- `npm run validate:assets`
- `npm run typecheck`
- `npm run lint`
- `npm run test:run`
- `npm run build`
- `npm run test:e2e -- tests/e2e --workers=1`

## Commit Message

```text
test(release): validate the complete 5PM RUSH game-feel loop

Plan: 2026-11-03-5pm-rush-game-feel
Phase: P08-playtest-and-regression
Task: T16-final-playtest-validation

- Capture distance-segment visual regression evidence
- Run the full asset, unit, build, lint, and E2E quality gate
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: pending (to be recorded after commit)
