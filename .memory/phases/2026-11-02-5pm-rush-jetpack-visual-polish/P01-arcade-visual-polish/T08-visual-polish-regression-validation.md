# Task: T08 Visual Polish Regression Validation

## Status: done ✅

## Goal

T01~T07의 실제 시각 결과와 기존 기능 보존을 1280×720 mock 로그인 플레이에서 동시에 검증하고, 이후 콘텐츠 제작자가 새 player/booster/laser/obstacle asset을 추가할 때 같은 오류를 재발시키지 않도록 test snapshot과 문서를 확정한다. 마지막에 production build에는 dev test API, mock auth, 원본 사진 파일명이 들어가지 않는지 검사한다.

## Decision Summary

- deterministic E2E는 `window.__5PM_RUSH_TEST_API__`를 사용하되 `import.meta.env.DEV`에서만 등록한다. production bundle에는 hook/mock login 문자열이 없어야 한다.
- screenshot은 시각 증거이고 snapshot은 parent hierarchy, animation state, resolved geometry, collision footprint, effect pool을 수치로 검증한다. `test-results/`는 commit하지 않는다.

## Implementation

### I01. Dev snapshot과 deterministic scenario 확장

- Related Files:
  - `src/game/test/GameTestApi.ts` :: `GameTestApi`, player/obstacle/effect snapshot types; modify
  - `src/game/scenes/RunScene.ts` :: test API registration and deterministic hooks; modify
  - `src/features/player/PlayerEntity.ts` :: final player snapshot; modify only to expose existing state
  - `src/features/obstacles/ObstacleEntity.ts` :: final obstacle snapshot; modify only to expose existing visual data
  - `tests/e2e/booster.spec.ts` :: rocket/flame/state screenshot; modify
  - `tests/e2e/obstacle.spec.ts` :: laser/security/warning screenshot; modify

#### Details

- **Snapshot Contract**:
  ```typescript
  export interface PlayerVisualRegressionSnapshot {
    animation: PlayerAnimation;
    spriteFrame: number;
    renderRootCount: number;
    playerChildCount: number;
    jetpackAttachmentCount: number;
    rocketFormParent: 'player-entity';
    flameParent: 'jetpack-attachment';
    hasDebugBounds: false;
    hasPersistentTrail: false;
    hasDetachedBoosterRoot: false;
    collisionBounds: { x: number; y: number; width: number; height: number };
  }

  export interface ObstacleVisualRegressionSnapshot {
    kind: string;
    visualId: string;
    orientation?: 'vertical' | 'horizontal';
    spanMode?: 'full' | 'fixed' | 'random';
    resolvedLength?: number;
    collisionLength?: number;
    activity?: 'charging' | 'active';
    displayWidth: number;
    displayHeight: number;
    collisionBounds: Array<{ x: number; y: number; width: number; height: number }>;
    warning: { visible: boolean; x: number; y: number; alpha: number; label: '← 위험' };
  }
  ```
- test API에는 `spawnDemoLaser`, `spawnDemoWarningObstacle`, `spawnDemoObstacle`, `activateBooster`, `deactivateBooster`, `clearDemoObstacles`, `forceCrash`, `getPlayerVisualSnapshot`, `getObstacleVisualSnapshot`를 유지한다. 실제 인증/저장 API를 우회하는 새 production hook을 만들지 않는다.
- E2E screenshot 파일명은 `player-animation-flight.png`, `rocket-booster-attached.png`, `laser-mechanical.png`, `security-obstacle-warning.png`, `hud-arcade.png`, `crash-feedback.png`로 구분하고 `test-results` 밖에 asset을 복사하지 않는다.

### I02. 전체 시나리오와 기존 기능 회귀

- Related Files:
  - `tests/e2e/auth.spec.ts` :: auth gate/mock login; read-only
  - `tests/e2e/run.spec.ts` :: title/start/HUD; modify
  - `tests/e2e/booster.spec.ts` :: initial/token booster; modify
  - `tests/e2e/collectible.spec.ts` :: coin/token/shield collection; modify
  - `tests/e2e/obstacle.spec.ts` :: obstacle collision/laser/warning; modify
  - `tests/e2e/playable-run.spec.ts` :: start→collect→booster→crash→result; modify
  - `tests/e2e/results.spec.ts` :: crash animation, save/retry; read-only unless final screenshot is added
  - `tests/e2e/leaderboard.spec.ts` :: staging placeholder; read-only

#### Details

- deterministic flow는 다음 순서를 모두 재현한다: mock login → start button → 5PM start sequence → initial booster/takeoff/fly → token/coin/shield pickup → booster deactivation/fall/land → warning laser/security obstacle → hit/dead/result → record save/retry.
- 인증된 staging 테스트는 `E2E_BASE_URL`가 있을 때 기존처럼 skip하고, local mock 테스트에서만 new screenshot/test hook을 사용한다.
- `/assets/` 응답 404, `page.on('console')` uncaught error, missing animation key, NaN position, `renderRootCount > 1`, `hasPersistentTrail === true`를 실패 처리한다.
- collision test는 laser glow/emitter/warning이 hitbox에 포함되지 않고 실제 beam과 player가 충돌할 때만 crash/shield/booster outcome이 발생하는지 확인한다.

### I03. 문서와 production guard

- Related Files:
  - `docs/content-authoring.md` :: player rows, booster VFX anchors, laser/obstacle visual catalog, HUD icon rules; modify
  - `docs/testing.md` :: visual snapshot/screenshot/asset guard commands; modify
  - `tests/e2e/production-guard.spec.ts` :: production bundle and asset filename guard; modify only for newly added original-photo patterns
  - `scripts/validate-assets.mjs` :: final required assets and frame metadata; modify

#### Details

- content authoring 문서에는 다음을 표로 기록한다: player 7 row × 4 frame map, fixed 384×170 cell/alpha 0, `JetpackAttachment` local child rule, `BoosterStyleDefinition.vfx`, laser `full/fixed/random` and display-vs-collision rule, obstacle visual id/motion catalog, HUD icon path.
- testing 문서에는 screenshot 이름과 snapshot fields, no-debug-rectangle/no-trail invariants, effect pool limits, production guard 목적을 설명한다. 새 asset을 추가할 때 `assetRegistry`와 `validate-assets.mjs`를 함께 수정하도록 한다.
- production guard는 `dist`에서 `__5PM_RUSH_TEST_API__`, 개발용 mock login, `/IMG_|photo/i`가 검색되지 않는지 검사하고, `public/assets` 파일명에서 `IMG_|photo|original|face`가 없는지 별도 검사한다. 일반 bundle code의 `face` 단어를 false positive로 검사하지 않는다.

## Acceptance Criteria

- [ ] 캐릭터 사각형/잔상/비행 중 RUN, detached rocket, oversized laser, purple sphere monster가 final screenshots에 없다.
- [ ] player/booster/laser/security obstacle/HUD/effect screenshots와 numeric snapshots가 모두 생성된다.
- [ ] 인증, 아이템, 부스터, 이동/충돌, 결과/기록/랭킹의 기존 E2E가 통과한다.
- [ ] production build/asset guard가 통과하고 `.memory/current.md`/phase/plan 상태가 완료로 갱신된다.

## Validation

- `git pull --ff-only origin main` — 최신 Task commit 동기화.
- `npm run typecheck` — frontend TypeScript 통과.
- `npx tsc --noEmit -p api/tsconfig.json` — Azure Functions 타입 통과.
- `npm run lint` — 전체 lint 통과.
- `npm run test:run` — 전체 unit test 통과.
- `npm run validate:assets` — 최종 asset/frame/original filename guard 통과.
- `npm run build` — production bundle 생성 통과.
- `if rg -q '__5PM_RUSH_TEST_API__|개발용 mock 로그인|IMG_|photo' dist; then exit 1; fi; if find public/assets -type f -print | rg -q '(?:IMG_|photo|original|face)'; then exit 1; fi` — production test/photo guard clean.
- `VITE_ENABLE_DEV_MOCK_AUTH=true npm run test:e2e` — local mock 전체 E2E 통과; 인증 staging placeholder는 기존 조건에 따라 skip.
- `git diff --check && git status --short --branch` — patch clean, 마지막 commit 후 `main...origin/main` 동기화.

## Commit Message

```text
test(game): validate jetpack joyride visual polish

Plan: 2026-11-02-5pm-rush-jetpack-visual-polish
Phase: P01-arcade-visual-polish
Task: T08-visual-polish-regression-validation

- cover player states, attached booster, laser, hazards, hud, and effects
- document content contracts and guard production test-only surfaces
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: `d75b5a9`
