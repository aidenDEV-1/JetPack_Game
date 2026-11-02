# Task: T04 Visual Regression Validation

## Status: done ✅

## Goal

캐릭터-제트팩 결합, 잔상 제거, 장애물 대비·우측 warning 개선이 실제 1280×720 게임 화면에서 함께 동작하며 기존 플레이 루프를 깨뜨리지 않는다는 자동 검증 증거를 남긴다.

## Decision Summary

- Phaser canvas 픽셀을 직접 추측하지 않고 dev-only `window.__5PM_RUSH_TEST_API__` snapshot과 고정 viewport screenshot을 함께 사용한다.
- mock 로그인·test hook은 production build에 들어가지 않아야 하며, screenshot/asset diagnostics는 `test-results/`에만 저장하고 커밋하지 않는다.

## Implementation

### I01. 결정적 visual debug contract

- Related Files:
  - `src/game/test/GameTestApi.ts` :: `GameTestApi`, player/booster/obstacle debug snapshot type — modify
  - `src/game/scenes/RunScene.ts` :: dev-only debug snapshot registration — modify
  - `src/features/player/PlayerEntity.ts` :: attachment/trail debug state accessor — modify only if needed
  - `src/features/obstacles/ObstacleEntity.ts` :: warning/display debug snapshot — modify only if needed

#### Details

- 필요한 경우 다음 read-only debug snapshot을 `import.meta.env.DEV`에서만 노출한다.

  ```typescript
  interface VisualRegressionSnapshot {
    player: {
      collisionBounds: { x: number; y: number; width: number; height: number };
      jetpackAttachmentCount: number;
      hasPersistentTrail: boolean;
      flameVisible: boolean;
    };
    obstacles: Array<{
      kind: string;
      x: number;
      displayWidth: number;
      displayHeight: number;
      warningVisible: boolean;
      warningX: number;
    }>;
  }
  ```

- `jetpackAttachmentCount`는 플레이어가 실행 중이어도 1을 넘지 않아야 하고 `hasPersistentTrail`은 항상 false여야 한다. debug data는 collision resolver나 gameplay state를 변경하지 않는다.
- production cleanup은 T09에서 추가한 `clearGameTestApi()` 경로를 유지하고, bundle grep에서 `__5PM_RUSH_TEST_API__`가 없어야 한다.

### I02. Playwright visual and runtime scenarios

- Related Files:
  - `tests/e2e/playable-run.spec.ts` :: mock login → clock → booster → items → screenshot/diagnostics — modify
  - `tests/e2e/booster.spec.ts` :: flame-only booster and no persistent trail — modify
  - `tests/e2e/obstacle.spec.ts` :: warning right-edge and enlarged obstacle — modify
  - `tests/e2e/results.spec.ts` :: crash/result remains after visual changes — read-only unless selector timing changes
  - `tests/e2e/production-guard.spec.ts` :: mock/test hook/original image guard — read-only

#### Details

- 모든 로컬 시나리오는 `VITE_ENABLE_DEV_MOCK_AUTH=true`에서 실행하고, viewport를 `{ width: 1280, height: 720 }`으로 고정한다.
- `page.on('console')`, `page.on('pageerror')`, `/assets/` response/request failure 수집기를 유지한다. 하나라도 오류가 있으면 테스트를 실패시킨다.
- playable screenshot은 시작 직후/부스터 중/장애물 warning 중 최소 1장씩 output path에 저장하고, 빈 단색 canvas가 아닌 이미지 레이어가 포함되는지 byte-size와 debug snapshot으로 확인한다.
- obstacle scenario는 warning indicator가 right edge에 나타난 뒤 hazard가 field에 진입하고, collision → gray fallen → 결과 panel 순서가 유지되는지 확인한다.

### I03. Full validation and regression guard

- Related Files:
  - `.memory` task/phase/current files — implementation completion and commit pointer; modify
  - `docs/testing.md` — visual regression manual/automated steps; modify if current commands omit this plan
  - `docs/content-authoring.md` — anchor, VFX, obstacle display/warning update locations; modify if needed

#### Details

- 검증 순서는 `lint → frontend/API typecheck → unit → asset validation → production build → production grep → E2E`로 기록한다.
- 기존 인증, 결과 저장, coin/token/shield, booster flight, background parallax 테스트가 모두 통과해야 한다. 시각 Task라서 collision bounds 또는 API schema를 바꾸지 않는다.
- 실패가 발생하면 screenshot/trace를 확인해 selector timeout, asset 404, 실제 runtime error를 분리하고, 임시 timeout 증가만으로 통과시키지 않는다.

## Acceptance Criteria

- [ ] 1280×720 mock 로그인 E2E에서 캐릭터·가방 불꽃·부스터·장애물 warning·결과 흐름이 모두 확인된다.
- [ ] `/assets/` 404, uncaught console error, stale trail object, missing warning indicator가 없다.
- [ ] production build에 mock login, dev test hook, 원본 얼굴 사진 패턴이 노출되지 않는다.
- [ ] 전체 unit, lint, frontend/API typecheck, asset validation, build, E2E가 통과한다.

## Validation

- `npm run lint` — lint 통과
- `npm run typecheck && npm exec tsc -- -p api/tsconfig.json --noEmit` — frontend/API typecheck 통과
- `npm run test:run` — 전체 unit tests 통과
- `npm run validate:assets` — required asset manifest 통과
- `npm run build` — production build 성공
- `rg -n "__5PM_RUSH_TEST_API__|개발용 mock 로그인|IMG_|photo" dist public/assets` — production guard pattern 미검출
- `VITE_ENABLE_DEV_MOCK_AUTH=true npm run test:e2e` — playable/booster/obstacle/results/production guard 통과

## Commit Message

```text
test(game): cover visual clarity regressions

Plan: 2026-11-02-5pm-rush-visual-cohesion
Phase: P01-visual-cohesion-and-hazard-clarity
Task: T04-visual-regression-validation

- verify attached jetpack visuals and trail-free booster rendering
- cover obstacle contrast, right-edge warnings, and production guards
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: test(game): cover visual clarity regressions
