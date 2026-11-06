# Task: T03 반응형 게임 프레임 및 Phaser 캔버스 확장

## Status: done

## Goal

브라우저 viewport를 넓혔을 때 1280px에서 더 이상 고정되지 않고 `.game-frame`과 Phaser canvas가 사용 가능한 가로 공간에 맞춰 함께 확대되도록 한다. 논리 게임 좌표와 16:9 비율, HUD·입력·충돌 기준은 유지해 화면 확대가 게임 난이도나 플레이어 위치를 바꾸지 않게 한다.

## Decision Summary

- CSS 컨테이너는 available width를 사용하고, Phaser는 기존 `Phaser.Scale.FIT`로 `1280×720` 논리 viewport를 CSS 크기에 비율 유지로 fit한다.
- `Phaser.Scale.RESIZE`로 전환하거나 `GAME_CONFIG.width/height`, `PLAYER_HEIGHT`, 장애물 spawn 좌표를 브라우저 픽셀 기준으로 재계산하지 않는다.

## Implementation

### I01. 게임 프레임의 고정 max-width 제거

- Related Files:
  - `src/styles/tokens.css` :: `.app-shell`, `.game-frame`, `.game-root`, `.game-root canvas` — responsive outer frame and canvas sizing; modify
  - `src/app/GameShell.tsx` :: `game-frame` wrapper — DOM structure contract; read-only unless CSS measurement requires a class-only adjustment
  - `src/app/App.tsx` :: loading frame fallback — same responsive frame class; read-only

#### Details

- `.game-frame`의 `width: min(1280px, 100%)`를 available width 기반으로 바꾼다. app shell의 좌우 padding을 제외한 영역을 전부 사용하도록 `width: 100%`와 명시적 `max-width` 부재를 적용한다.
- `.game-frame`의 `aspect-ratio: 16 / 9`, `overflow`, border, radius, background는 유지한다. 화면이 커져도 Phaser canvas와 HTML HUD가 같은 frame 경계를 공유해야 한다.
- `.game-root`와 canvas의 `width: 100%; height: 100%; display: block`을 유지해 Phaser canvas의 CSS box가 frame을 채우도록 한다.
- `.app-shell`은 기존 중앙 정렬과 배경을 유지하되, 넓은 화면에서 frame을 다시 1280px로 줄이는 `max-width`를 추가하지 않는다. 기존 모바일 padding 및 320px body 최소 폭과 충돌하지 않게 한다.
- 세로가 짧은 viewport에서 frame이 화면을 덮는 문제를 확인한다. 필요한 경우 app shell에만 responsive padding/overflow 조정을 하고, 16:9 frame을 찌그러뜨리는 고정 height는 추가하지 않는다.

### I02. Phaser scale contract를 유지하고 resize 회귀를 검증

- Related Files:
  - `src/game/PhaserGame.ts` :: `createPhaserGame` Phaser config — logical viewport and scale mode; read-only unless source-of-truth import is needed
  - `src/game/config/gameConfig.ts` :: `GAME_CONFIG.width`, `GAME_CONFIG.height` — logical dimensions; read-only
  - `tests/e2e/responsive-layout.spec.ts` :: responsive frame/canvas smoke test; new

#### Details

- Phaser config remains `width: 1280`, `height: 720`, `scale.mode: Phaser.Scale.FIT`, `autoCenter: Phaser.Scale.CENTER_BOTH`. Resize implementation must not replace this with `RESIZE`.
- Add a Playwright test that runs only in local dev mock mode (skip when `E2E_BASE_URL` is set), opens the app, clicks `개발용 mock 로그인`, waits for `5PM RUSH 시작`, and measures `.game-frame` and `.game-root canvas` using `getBoundingClientRect()`.
- At viewport `1280×900`, record the frame width. Change viewport to `1920×1080`, wait for the browser resize/layout cycle, and assert the frame width increases substantially while `height / width` remains within `0.01` of `9/16`.
- Assert the canvas rect width and height match the frame rect within 2 CSS pixels, and the canvas remains inside the frame without horizontal overflow.
- Optionally use a third `800×900` viewport assertion to ensure the frame shrinks with the available width and the start button remains visible; do not assert fixed pixel values for small screens.

### I03. Documentation and full regression validation

- Related Files:
  - `SPEC.md` :: common viewport/layout constraints — document logical-vs-CSS responsive behavior; modify
  - `docs/game-design/11-tech-stack.md` :: Phaser scaling rule and validation command; modify
  - `README.md` :: local test note if the responsive behavior needs a user-facing instruction; modify only if needed

#### Details

- `SPEC.md`에 논리 viewport는 `1280×720`으로 고정하지만 CSS game frame/canvas는 available browser width에 맞춰 `16:9`로 확대된다는 규칙을 추가한다.
- `docs/game-design/11-tech-stack.md`에 `Phaser.Scale.FIT`와 responsive CSS frame을 담당 구현으로 기록한다. 서버 인증·기록 API·게임 좌표 계약은 이번 변경 대상이 아니라고 명시한다.
- README에는 사용자가 브라우저를 넓혀도 동일 URL에서 게임 화면이 함께 확대된다는 짧은 테스트 안내를 추가할 수 있지만, 기능을 위해 불필요한 문서는 늘리지 않는다.

## Acceptance Criteria

- [ ] 1920px viewport에서 game frame이 1280px에 고정되지 않고 가용 너비에 맞춰 증가한다.
- [ ] frame과 canvas가 16:9 비율과 동일한 CSS 크기를 유지한다.
- [ ] Phaser logical viewport는 `1280×720`, scale mode는 `FIT`이고 게임 월드의 player/obstacle 좌표는 변경되지 않는다.
- [ ] 좁은 viewport에서도 frame·start overlay·HUD가 잘리지 않고 기존 모바일 CSS 동작이 유지된다.
- [ ] responsive Playwright test와 full build/typecheck/lint가 통과한다.

## Validation

- `npm run test:e2e -- tests/e2e/responsive-layout.spec.ts --workers=1` — 1280/1920 viewport resize assertions 통과
- `npm run typecheck && npm run lint && npm run build` — scale/CSS 변경에 대한 정적 검증 통과
- `npm run test:run` — 기존 게임 로직 회귀 없음

## Commit Message

```text
fix(layout): make the game frame responsive to viewport width

Plan: 2026-11-06-obstacle-playability-responsive
Phase: P01-obstacle-playability-responsive
Task: T03-responsive-game-frame

- let the CSS game frame expand beyond the old 1280px cap
- preserve the 1280x720 Phaser FIT viewport with responsive coverage
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: pending
