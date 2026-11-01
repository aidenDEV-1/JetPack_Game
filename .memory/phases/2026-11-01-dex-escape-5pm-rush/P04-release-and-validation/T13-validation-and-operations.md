# Task: T13 Validation and Operations

## Status: pending

## Goal
게임 핵심 루프와 인증·저장·랭킹·배포를 검증하고, 이후 11개 콘텐츠 요소를 독립적으로 수정·추가할 수 있는 운영 문서를 남긴다.

## Decision Summary
- 지원 브라우저는 최신 Chrome·Microsoft Edge이며, 한국어 PC 키보드 게임만 검증한다.
- 초기 프로토타입은 클라이언트 결과를 신뢰하지만, 공식 보상 전환 시 서버 검증을 별도 계획으로 승격한다.

## Implementation

### I01. Automated and browser validation
- Related Files:
  - `tests/e2e/auth.spec.ts` — auth gate; new
  - `tests/e2e/run.spec.ts` — start/play/crash/result; new
  - `tests/e2e/leaderboard.spec.ts` — save/ranking/retry; new
  - `docs/testing.md` — test matrix; new

#### Details
- Test scenarios: unauthenticated redirect; company login; 3-second start; space flight; ceiling bounce; floor run; coin/token/shield collection; 3-token booster; speed at each 1,000m; warning missile; unannounced forced pattern after shield; shield consumption; pause/focus loss; crash gray state; exact result messages; save failure retry.
- Use deterministic RNG seed for automated spawn tests; keep visual smoke test for real animation and audio.
- Verify no duplicate save request after retry success.

### I02. Content maintenance guide
- Related Files:
  - `docs/content-authoring.md` — how to add each content module; new
  - `docs/architecture.md` — feature boundaries and event contracts; new
  - `docs/security-notes.md` — prototype trust limitation and future server validation; new

#### Details
- Document the exact edit locations for: concept copy, player assets, jetpack layers, item definitions, DEX token logo, background segments, ceiling/floor config, speed progression, booster duration, obstacle patterns, game flow, and Azure stack.
- State that new content must use the existing types/events instead of editing unrelated systems.
- Record that original face photo must not be committed or deployed; only the illustrated game asset is allowed.

## Acceptance Criteria
- [ ] Automated checks cover all requested gameplay elements and critical edge cases.
- [ ] Chrome and Edge smoke tests pass on a deployed staging URL.
- [ ] Content authoring guide identifies one independent update location for each requested element.
- [ ] Prototype security limitation and future authoritative validation requirement are documented.

## Validation
- `npm run lint && npm run typecheck && npm run test:run` — all checks pass.
- `npx playwright test tests/e2e` — authenticated staging E2E suite passes.
- `git diff --check` — no whitespace errors.

## Commit Message
```text
test(qa): validate gameplay and document content maintenance

Plan: 2026-11-01-dex-escape-5pm-rush
Phase: P04-release-and-validation
Task: T13-validation-and-operations

- add browser smoke coverage for auth gameplay persistence and ranking
- document independent content modules and prototype security boundaries
```

## Progress
- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
