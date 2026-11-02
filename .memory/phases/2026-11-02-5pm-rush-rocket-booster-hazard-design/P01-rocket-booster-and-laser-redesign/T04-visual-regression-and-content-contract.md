# Task: T04 Visual Regression and Content Contract

## Status: pending

## Goal

T01~T03의 캐릭터 투명 프레임, 가방→로켓 변환, 레이저 span, 장애물 대비·warning을 실제 1280×720 mock 로그인 플레이 루프에서 검증하고, 향후 로켓 스타일과 장애물 패턴을 다른 feature를 깨뜨리지 않고 추가할 수 있도록 콘텐츠 수정 가이드를 갱신한다.

## Decision Summary

- 테스트는 `window.__5PM_RUSH_TEST_API__`의 개발용 hook으로 deterministic 시나리오를 만들되, production build에는 해당 hook과 mock auth 문자열이 포함되지 않는 현재 guard를 유지한다.
- screenshot은 시각 증거로 사용하고, snapshot은 attachment parent·resolved laser geometry·collision footprint를 수치로 검증해 “보인다”와 “충돌한다”를 혼동하지 않게 한다.

## Implementation

### I01. 게임 테스트 API와 debug snapshot 확장

- Related Files:
  - `src/game/test/GameTestApi.ts` :: `GameTestApi`, player/obstacle snapshot interfaces — 로켓 form·laser geometry debug 계약; modify
  - `src/game/scenes/RunScene.ts` :: `registerDevTestApi`, demo booster/obstacle hooks — test-only snapshot과 deterministic spawn 노출; modify
  - `src/features/player/PlayerEntity.ts` :: `PlayerVisualDebugSnapshot` — style/mode/parent/no-trail fields; read-only unless T02 fields require update
  - `src/features/obstacles/ObstacleEntity.ts` :: visual debug snapshot — span/orientation/display/collision/warning fields; read-only unless T03 fields require update

#### Details

- **Expected Snapshot Contracts**:

  ```typescript
  interface PlayerVisualDebugSnapshot {
    collisionBounds: { x: number; y: number; width: number; height: number };
    boosterStyleId: BoosterStyleId;
    boosterMode: BoosterFormMode;
    rocketFormVisible: boolean;
    rocketFormParent: 'player-entity';
    hasDetachedBoosterRoot: false;
    hasPersistentTrail: false;
    flameVisible: boolean;
  }

  interface ObstacleVisualDebugSnapshot {
    kind: string;
    orientation?: 'vertical' | 'horizontal';
    spanMode?: 'full' | 'fixed' | 'random';
    resolvedLength?: number;
    collisionLength?: number;
    displayWidth: number;
    displayHeight: number;
    collisionBounds: Array<{ x: number; y: number; width: number; height: number }>;
    warning: { visible: boolean; x: number; y: number; alpha: number; label: '← 위험' };
  }
  ```

- Debug API는 gameplay state를 직접 바꾸는 hook과 시각 snapshot을 분리한다. `spawnDemoRocketBooster` 같은 별도 visual root를 만들지 않고 기존 `activateBooster`를 사용한다.
- laser demo hook은 `short`, `full-vertical`, `full-horizontal` 패턴을 명시적으로 선택할 수 있게 하되, 실제 production `ObstacleSpawner` random pool을 우회하는 것은 테스트 환경에서만 허용한다.
- `getPlayerVisualSnapshot`과 `getObstacleVisualSnapshot`은 `import.meta.env.DEV` guard 안에 등록하고 production bundle guard에서 이름이 노출되지 않는지 확인한다.

### I02. E2E 시나리오와 screenshot 증거

- Related Files:
  - `tests/e2e/booster.spec.ts` :: rocket form attachment lifecycle — modify
  - `tests/e2e/obstacle.spec.ts` :: laser spans, high contrast, warning indicator — modify
  - `tests/e2e/playable-run.spec.ts` :: normal run/background/collectible regression — read-only unless new setup is needed
  - `tests/e2e/results.spec.ts` :: crash gray state and result message — read-only unless collision visual change affects timing
  - `docs/testing.md` :: visual regression commands and expected evidence — modify

#### Details

- **Booster scenario**:
  1. mock 로그인 후 start button을 누르고 3-2-1 countdown을 완료한다.
  2. `activateBooster()`로 초기 부스터를 재현하고, player snapshot에서 `rocketFormVisible=true`, `boosterStyleId='leather-rocket'`, `rocketFormParent='player-entity'`, `hasDetachedBoosterRoot=false`, `hasPersistentTrail=false`를 확인한다.
  3. booster outbound/hold/return 중 screenshot을 `test-results/rocket-booster.png`에 저장하고 player x가 이동해도 rocket form이 같은 player 계층에 있음을 확인한다.
  4. deactivate/reset 후 form hidden, collision `84×68`, gray/crash 결과가 기존 계약과 같은지 확인한다.

- **Laser/hazard scenario**:
  1. demo hook으로 short vertical laser를 생성하고 `resolvedLength`가 지정 범위, display bounds가 core collision보다 크거나 같은지 확인한다.
  2. full vertical과 full horizontal laser를 각각 생성해 viewport span과 emitter 위치가 화면 경계를 기준으로 배치되는지 확인하고 `test-results/laser-full-span.png`를 저장한다.
  3. missile 또는 full-span warning pattern을 우측 밖에서 생성해 `warning.visible=true`, x `> 1100`, label `← 위험`, alpha pulse가 확인되는 순간 `test-results/hazard-warning.png`를 저장한다.
  4. laser glow/emitter/warning이 collision list에 들어가지 않고, 실제 beam hitbox와 player 충돌 시 기존 crash/방어막/부스터 무적 결과가 유지되는지 확인한다.

- **Asset/console guards**:
  - `/assets/` 응답 오류, uncaught console error, missing spritesheet frame을 실패 처리한다.
  - production build에서 `__5PM_RUSH_TEST_API__`, 개발용 mock login 문자열, 원본 사진 파일명(`IMG_`, `photo`, `face`)이 검색되지 않아야 한다.
  - screenshot은 단색 canvas가 아니고 player/rocket/laser/emitter 픽셀이 포함되어야 한다. 저장소에는 `test-results/` output을 커밋하지 않는다.

### I03. 콘텐츠 authoring 문서와 회귀 계약

- Related Files:
  - `docs/content-authoring.md` :: player/booster/obstacle asset editing guide — 로켓 style catalog와 laser span 추가 순서; modify
  - `docs/testing.md` :: commands, snapshots, screenshot evidence — modify
  - `src/content/assets/playerAssets.ts` :: asset descriptions — read-only unless T01 naming differs
  - `src/features/booster/boosterStyleCatalog.ts` :: future coin style extension example — read-only unless docs need exported symbol
  - `src/features/obstacles/obstacleTypes.ts` :: pattern type reference — read-only

#### Details

- 문서에는 다음 ownership을 명시한다.
  - 캐릭터 투명 프레임: `public/assets/player/player-spritesheet.png` + `gameAssets.ts` metadata.
  - 로켓 스타일: `boosterStyleTypes.ts`/`boosterStyleCatalog.ts` + `booster-forms-spritesheet.png`; 상점이 생겨도 `PlayerEntity`를 직접 수정하지 않는다.
  - 로켓 부착·변환 lifecycle: `JetpackAttachment.ts`와 `PlayerEntity.ts`; `RunScene.ts`에 별도 rocket sprite를 만들지 않는다.
  - 레이저 span: `obstacleTypes.ts`, `obstaclePatterns.ts`, `laserSpanResolver.ts`; visual renderer는 `LaserHazardVisual.ts`에 둔다.
  - 충돌·방어막·경고 lifecycle: `ObstacleEntity.ts`, `ObstacleField.ts`, `ObstacleWarningIndicator.ts`.
- 새 로켓 스타일을 추가할 때 필요한 값은 `id`, texture key, frame count, anchor, scale, coin price, default unlock 여부이며, 구매/소유 상태는 향후 backend task에서 다룬다고 명시한다.
- 새 laser pattern은 `spanMode`, min/max 또는 fixed length, visual colors, warning flag, collision footprint를 함께 등록해야 하며, glow 크기를 collision 크기로 복사하지 않는다는 주의사항을 기록한다.

### I04. 전체 품질 검증과 완료 증거

- Related Files:
  - `package.json` :: existing lint/typecheck/test/build scripts — command contract; read-only
  - `.memory/current.md` :: active task pointer — T04 완료 후 다음 pointer/plan status update; modify
  - `.memory/phases/2026-11-02-5pm-rush-rocket-booster-hazard-design/P01-rocket-booster-and-laser-redesign/phase.md` :: task status/progress — modify
  - `.memory/plans/2026-11-02-5pm-rush-rocket-booster-hazard-design.md` :: plan/phase status — modify

#### Details

- 순서대로 `git pull --ff-only origin main`, 관련 unit test, lint/typecheck, asset validation, build, mock E2E를 실행한다. 실패한 시각 회귀는 snapshot/screenshot으로 원인을 좁힌 뒤 해당 Task 범위에서 수정한다.
- 기존 인증, 결과 저장, 코인/token/shield 수집, background parallax, pause/focus loss, forced pattern 테스트를 모두 재실행한다.
- build 후 `dist`에서 test API/mock auth/original photo guard를 검사하고, build output에 새 asset이 포함되는지 확인한다.
- 모든 검증이 통과하면 T04 progress, P01 progress, plan phase status, `.memory/current.md`를 완료 상태로 갱신한다. Task별 commit/push는 memory-execute 규칙에 따라 각 Task에서 남겨야 한다.

## Acceptance Criteria

- [ ] 1280×720 화면에서 캐릭터 주변 네모 후광이 없고, 부스터 시 가방이 로켓형으로 변환되어 캐릭터에 붙어 보인다.
- [ ] 로켓 스타일과 레이저 span이 snapshot으로 확인되며, 향후 coin style 추가 지점이 문서화되어 있다.
- [ ] short/full/random 레이저와 warning indicator screenshot이 저장되고, 실제 충돌·무적·방어막 결과가 회귀하지 않는다.
- [ ] asset 404, console error, persistent trail, detached rocket root, production test hook 노출이 없다.
- [ ] 전체 unit/E2E/build 검증과 GitHub 동기화가 완료된다.

## Validation

- `npm run lint` — 전체 ESLint 통과.
- `npm run typecheck && npm exec tsc -- -p api/tsconfig.json --noEmit` — frontend/API 타입 검사 통과.
- `npm run test:run` — 전체 unit test 통과.
- `npm run validate:assets` — 최종 에셋과 spritesheet metadata 통과.
- `npm run build` — production build 통과.
- `VITE_ENABLE_DEV_MOCK_AUTH=true npm run test:e2e` — booster, laser span, warning, collision, results, playable run 시나리오 통과.
- `if rg -n "__5PM_RUSH_TEST_API__|개발용 mock 로그인|IMG_|photo|face" dist public/assets; then exit 1; else echo "production guard patterns: clean"; fi` — production guard clean.

## Commit Message

```text
test(game): validate rocket booster and laser visual redesign

Plan: 2026-11-02-5pm-rush-rocket-booster-hazard-design
Phase: P01-rocket-booster-and-laser-redesign
Task: T04-visual-regression-and-content-contract

- cover attached rocket forms and full/fixed laser span screenshots
- document content contracts and guard production test-only surfaces
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
