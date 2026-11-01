# Task: T09 UI and Audio

## Status: pending

## Goal
레퍼런스의 어두운 패널형 스타일을 유지하면서 최신 웹 게임 수준의 선명한 한국어 HUD, 음소거, 설정, 일시정지 UI를 구현한다.

## Decision Summary
- 16:9 게임 캔버스와 React 오버레이를 함께 사용하며, UI는 한국어만 제공한다.
- 로그인 후 사운드 자동재생을 시도하고, 우측 상단 음소거·설정 아이콘을 제공한다.

## Implementation

### I01. Design tokens and HUD
- Related Files:
  - `src/styles/tokens.css` — colors, typography, spacing; new
  - `src/features/hud/GameHud.tsx` — distance, coins, tokens, shield; new
  - `src/features/hud/hudTypes.ts` — view model; new

#### Details
- Use navy/steel background, yellow accent, white numeric HUD, high-contrast focus states.
- HUD fields: padded distance in meters, current run coins, token count `0/3`, shield state, pause/settings button.
- Keep HUD React-owned; Phaser emits immutable snapshots through `GameBridge`.

### I02. Settings, pause, and audio
- Related Files:
  - `src/features/settings/SettingsMenu.tsx` — pause/resume/mute controls; new
  - `src/services/audio/AudioController.ts` — music/SFX state; new
  - `src/features/settings/__tests__/SettingsMenu.test.tsx` — tests; new

#### Details
- Buttons: `다시 진행`, `음소거`, `소리 켜기`, `게임 나가기` where applicable.
- On login, attempt music playback; if browser rejects autoplay, defer until first button click.
- Canvas outside click and `visibilitychange`/`blur` call `pause`; resume starts the 3-2-1 countdown.
- Mute state controls music and effects together and persists only for the current session.

## Acceptance Criteria
- [ ] HUD remains crisp at 16:9 scaling and does not distort numeric values.
- [ ] Settings icon is fixed at top right and can pause/resume.
- [ ] Outside click, tab switch, and window blur pause the game.
- [ ] Sound autoplay failure does not break game start; mute works for music and SFX.

## Validation
- `npm run test:run -- src/features/hud src/features/settings` — UI tests pass.
- Chrome and Edge manual test at 1280x720, 1366x768, and 1920x1080.

## Commit Message
```text
feat(ui): add Korean game HUD settings and audio controls

Plan: 2026-11-01-dex-escape-5pm-rush
Phase: P03-content-and-ui
Task: T09-ui-and-audio

- add high-contrast 16:9 HUD and settings overlay
- handle autoplay fallback, mute, focus pause, and countdown resume
```

## Progress
- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
