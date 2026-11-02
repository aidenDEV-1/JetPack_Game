# Task: T06 Arcade HUD Redesign

## Status: pending

## Goal

현재 반투명 웹 대시보드처럼 보이는 상단 UI를 게임 화면을 가리지 않는 아케이드 HUD로 교체한다. 거리·코인·DEX 토큰·방어막·부스터 남은 시간을 큰 숫자와 작은 아이콘/게이지로 즉시 읽을 수 있게 하고, 설정/일시정지/음소거 기능은 유지하면서 설정 버튼이 음소거 아이콘으로 바뀌는 현재 혼동도 제거한다.

## Decision Summary

- HUD는 기존 React overlay(`GameHud`/`GameShell`)에 유지하되 카드형 dashboard가 아닌 compact arcade readout으로 스타일링한다. Phaser canvas와 게임 로직을 재작성하지 않는다.
- 부스터 남은 시간은 숫자만 표시하지 않고 0–1 clamped progress meter와 `aria-valuenow`를 함께 제공한다. 설정 메뉴에서 pause/resume/mute를 유지하고 HUD 우측 버튼은 항상 설정 아이콘으로 표시한다.

## Implementation

### I01. HUD view model과 컴포넌트 구조

- Related Files:
  - `src/features/hud/hudTypes.ts` :: `HudViewModel`, `initialHud`; modify
  - `src/features/hud/GameHud.tsx` :: `GameHud`, `BoosterMeter`, icon/readout markup; modify
  - `src/app/GameShell.tsx` :: `toHudViewModel`, `GameHud` props, settings/mute wiring; modify
  - `src/features/settings/SettingsMenu.tsx` :: pause/resume/mute actions; read-only unless labels need alignment
  - `src/styles/tokens.css` :: HUD layout/theme tokens; modify

#### Details

- **Signatures & Types**:
  ```typescript
  export interface HudViewModel {
    distanceMeters: number;
    runCoins: number;
    tokenCount: number;
    hasShield: boolean;
    boosterActive: boolean;
    boosterRemainingMs: number;
    paused: boolean;
  }

  interface GameHudProps extends HudViewModel {
    muted: boolean;
    onSettings: () => void;
  }

  function BoosterMeter(props: {
    active: boolean;
    remainingMs: number;
    maxMs: number;
  }): JSX.Element;
  ```
- markup는 다음 의미 영역을 갖는다.
  - `.hud-distance-readout`: `비행 거리` label + zero-padded `00000M`
  - `.hud-coin-readout`: 기존 runCoins
  - `.hud-token-readout`: DEX icon + `{tokenCount}/3` 및 3개 segment
  - `.hud-shield-readout`: shield icon + `방어막` active/inactive state
  - `.hud-booster-meter`: `BOOSTER` label + percent-width fill + remaining seconds
  - `.hud-settings-button`: always `⚙`/accessible `설정 열기`; muted 상태를 이 버튼의 icon으로 대체하지 않는다.
- `boosterRemainingMs`는 `Math.max(0, Math.min(1, remainingMs / 5000))`으로 표시하고, active false면 meter를 dim 처리한다. run state/BoosterController의 duration을 변경하지 않는다.
- token/coin/shield icon은 emoji에 의존하지 않는다. React가 읽을 수 있는 작은 transparent PNG/SVG asset을 사용하고 `alt=''` + 주변 text/aria-label로 의미를 제공한다.

### I02. HUD asset와 CSS 아트 디렉션

- Related Files:
  - `public/assets/ui/dex-token-icon.png` :: DEX 로고 token icon; new
  - `public/assets/ui/coin-icon.png` :: coin icon; new
  - `public/assets/ui/shield-icon.png` :: shield icon; new
  - `public/assets/ui/booster-icon.png` :: rocket/booster icon; new
  - `scripts/validate-assets.mjs` :: UI icon required files; modify
  - `src/styles/tokens.css` :: `.game-hud`, `.hud-*`, meter/pulse/focus style; modify

#### Details

- 아이콘은 원본 사진 없이 DEX logo/기존 item 인상을 참고한 투명 raster 또는 code-native vector로 만들고, 게임 canvas의 navy/amber/cyan/red palette에 맞춘다.
- `.game-hud`는 pointer-events none, 버튼/interactive child만 pointer-events auto로 유지한다. 상단 readout은 `rgba` 큰 panel 대신 얇은 inset highlight, dark navy backing, amber/cyan accent를 사용한다.
- 거리 숫자는 가장 큰 요소, coin/token은 2차 정보, shield/booster는 오른쪽 compact status row에 둔다. 모바일에서 사라지게 하는 `display:none` 규칙을 추가하지 말고 좁은 폭에서는 padding/font만 줄인다.
- HUD는 `z-index`가 canvas보다 높지만 `results-layer`, settings backdrop보다 낮아 pause/results overlay가 가리지 않도록 기존 stacking order를 보존한다.
- focus-visible, contrast, `aria-live='polite'`를 숫자 변화에 적용하되 매 frame React state를 강제 갱신하지 않는다. 현재 `GameShell.emitSnapshot` throttle을 유지한다.

### I03. UI regression tests

- Related Files:
  - `src/features/hud/GameHud.test.tsx` :: HUD rendering/aria tests; new
  - `src/features/settings/SettingsMenu.test.tsx` :: pause/resume/mute existing tests; modify only if labels change
  - `tests/e2e/run.spec.ts` :: start/HUD screenshot; modify
  - `tests/e2e/playable-run.spec.ts` :: collection/booster HUD values; modify

#### Details

- unit tests는 distance `34 → 00034M`, coin count, token `2/3`, shield inactive/active, booster 2500ms meter width/aria value, muted 설정 state를 확인한다.
- E2E는 시작 화면에서 HUD label이 보이고, mock run에서 coin/token/booster values가 갱신되며, 설정 버튼이 `설정 열기`로 계속 존재하는지 확인한다.
- screenshot 비교는 HUD가 game frame을 과도하게 덮지 않는지와 dashboard-like oversized panel이 없는지를 시각적으로 확인하고, 텍스트/aria assertion을 함께 사용한다.

## Acceptance Criteria

- [ ] HUD가 웹 대시보드가 아닌 compact arcade game HUD로 보인다.
- [ ] 거리·코인·DEX 토큰·방어막·부스터 게이지·설정 버튼이 1280×720에서 모두 읽힌다.
- [ ] 설정의 pause/resume/countdown/mute 및 focus-loss pause가 기존처럼 동작한다.
- [ ] HUD가 게임 화면의 캐릭터/장애물을 가리지 않고 접근성 label/focus를 제공한다.

## Validation

- `npm run typecheck && npm run lint` — React props/CSS imports와 type 검사 통과.
- `npm run test:run -- src/features/hud/GameHud.test.tsx src/features/settings/SettingsMenu.test.tsx` — HUD/settings tests 통과.
- `npm run validate:assets` — UI icon assets와 원본 사진 guard 통과.
- `VITE_ENABLE_DEV_MOCK_AUTH=true npx playwright test tests/e2e/run.spec.ts tests/e2e/playable-run.spec.ts --workers=1` — HUD/start/collection/booster regression 통과.

## Commit Message

```text
feat(hud): redesign arcade game readouts

Plan: 2026-11-02-5pm-rush-jetpack-visual-polish
Phase: P01-arcade-visual-polish
Task: T06-arcade-hud-redesign

- replace dashboard cards with compact arcade HUD and booster meter
- keep settings, pause, mute, and accessible status readouts
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
