# Task: T09 Playable Regression Validation

## Status: done ✅

## Goal

mock 로그인만으로 사람이 실제로 시작·상승·아이템 수집·부스터·충돌·결과까지 확인할 수 있는 E2E와 콘텐츠 회귀 검사를 추가한다. 최종 build에서 빈 배경, asset 404, 정지한 아이템, 이동하지 않는 부스터가 다시 생기지 않도록 증거를 남긴다.

## Decision Summary

- E2E는 `VITE_ENABLE_DEV_MOCK_AUTH=true`에서만 실행하며, production bundle에 mock login 경로와 test hook이 노출되지 않는지 함께 검사한다.
- Phaser canvas 내부 픽셀만으로 상태를 추측하지 않도록 dev-only `window.__5PM_RUSH_TEST_API__`와 bridge snapshot을 사용하되, 시각 검증은 고정 viewport screenshot과 console/network 오류 검사로 보완한다.

## Implementation

### I01. Deterministic dev test API

- Related Files:
  - `src/game/test/GameTestApi.ts` :: dev-only test API contract — new
  - `src/game/scenes/RunScene.ts` :: demo item/obstacle/booster controls — modify
  - `src/app/GameShell.tsx` :: test API cleanup — modify
  - `src/vite-env.d.ts` :: window augmentation — modify

#### Details

- `import.meta.env.DEV`에서만 다음 API를 노출한다.

  ```typescript
  interface GameTestApi {
    getSnapshot(): RunState;
    spawnDemoItems(): void;
    spawnDemoObstacle(): void;
    activateBooster(): void;
    forceCrash(): void;
  }
  ```

- `forceCrash`와 demo spawn은 production compile path에서 tree-shake되거나 호출 불가해야 하며, E2E가 끝나면 `window.__5PM_RUSH_TEST_API__`를 삭제한다.

### I02. Playwright scenarios and visual checks

- Related Files:
  - `tests/e2e/playable-run.spec.ts` :: full mock-auth run — new
  - `tests/e2e/results.spec.ts` :: crash/result message/save — new
  - `tests/e2e/auth.spec.ts`, `tests/e2e/run.spec.ts` :: selectors/start regression — modify

#### Details

- scenario A: mock login → start button → clock 5:00:00/alarm state → initial booster activation → snapshot에서 distance 증가와 booster active 확인.
- scenario B: `spawnDemoItems()` → coin/shield/token이 canvas에 표시되는 동안 snapshot runCoins/tokenCount/hasShield가 변경되는지 확인. token 3개 후 booster active 확인.
- scenario C: `spawnDemoObstacle()`와 `forceCrash()` → 캐릭터 crash animation 대기 → 결과 panel과 정확한 message/save state 확인.
- 모든 scenario는 console error와 `/assets/` HTTP 404를 수집해 실패시키며, 1280×720 screenshot을 저장한다. background screenshot은 빈 단색 canvas가 아닌 최소 한 개의 이미지 layer가 보이는지 baseline으로 비교한다.

### I03. Full repository validation and production guard

- Related Files:
  - `tests/e2e/production-guard.spec.ts` :: mock/test hook absence — new
  - `docs/testing.md` :: new playable test steps — modify
  - `docs/content-maintenance.md` :: asset/content update guide — new or modify

#### Details

- production build grep/Playwright check로 `개발용 mock 로그인`, `__5PM_RUSH_TEST_API__`, 원본 사진 파일이 노출되지 않는지 검증한다.
- 문서에는 새 이미지/manifest key 추가 순서, 구간별 배경 교체, 캐릭터 animation frame 교체, item spawn cadence 수정 위치를 각각 적는다. 콘텐츠를 한 파일에 합치지 않는다.
- 전체 검증은 lint, frontend/API typecheck, unit test, asset validation, build, E2E를 모두 실행하고, 실패 시 해당 Task에서 멈춘다.

## Acceptance Criteria

- [ ] mock 로그인으로 실제 플레이 전체 흐름을 자동 재현한다.
- [ ] E2E 중 asset 404와 uncaught console error가 없다.
- [ ] initial/token booster, item collection, obstacle crash, result save가 모두 snapshot과 화면에서 검증된다.
- [ ] production build에 mock login/test API/원본 얼굴 사진이 포함되지 않는다.
- [ ] 콘텐츠별 업데이트 방법이 문서화된다.

## Validation

- `npm run lint` — lint 통과
- `npm run typecheck` — frontend/API typecheck 통과
- `npm run test:run` — 전체 unit test 통과
- `npm run validate:assets` — 모든 이미지 경로와 manifest 통과
- `npm run build` — production build 성공
- `VITE_ENABLE_DEV_MOCK_AUTH=true npm run test:e2e` — playable/result/guard E2E 통과
- `rg -n "__5PM_RUSH_TEST_API__|개발용 mock 로그인|IMG_|photo" dist public/assets` — production asset에서 테스트 hook/mock/original photo가 검출되지 않음

## Commit Message

```text
test(game): verify playable assets and run loop end to end

Plan: 2026-11-01-5pm-rush-playable-content
Phase: P03-results-and-regression
Task: T09-playable-regression-validation

- add deterministic mock-auth gameplay and crash regression coverage
- validate asset loading, visual scenes, and production test-hook removal
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: test(game): verify playable assets and run loop end to end

