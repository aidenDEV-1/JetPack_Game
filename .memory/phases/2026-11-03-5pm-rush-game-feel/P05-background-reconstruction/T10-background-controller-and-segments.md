# Task: T10 배경 컨트롤러와 거리 구간 확장

## Status: done

## Goal

`BackgroundController`가 L0~L3를 독립적으로 반복 이동하고, 각 1000m 구간 전환 시 전용 transition tile을 사용하도록 바꾼다. 사무실 검증 후 보안 게이트·도심·지하철 3구간·옥상으로 같은 레이어 계약을 확장하며 구간 라벨이 HUD와 겹치지 않게 한다.

## Decision Summary

- 배경 Scene은 거리 구간 테이블을 유지한다: 0 사무실, 1000 보안, 2000 도심, 3000 지하철, 4000 옥상.
- 지하철 3000~4000m는 entrance/inside/exit 세 장면을 사용하되, 각 장면도 L0~L3 계약을 따라야 한다.

## Implementation

### I01. Layered tile controller

- Related Files:
  - `src/features/background/BackgroundController.ts` :: `BackgroundTile`, `update`, `applyScene`; modify
  - `src/content/backgroundLayers.ts` :: `backgroundLayerDefinitions`; modify
  - `src/content/backgroundSegments.ts` :: `resolveBackgroundScene`, `resolveBackgroundSegmentIndex`; read-only/modify tests only
  - `src/game/config/tuning/background.ts` :: layer scroll/transitions; modify

#### Details

```typescript
interface BackgroundTile {
  sprite: Phaser.GameObjects.Image;
  transitionSprite: Phaser.GameObjects.Image;
  x: number;
}

public update(deltaMs: number, worldSpeed: number, distanceMeters: number): void;
public getTransitionSnapshot(): BackgroundTransitionSnapshot;
```

- 레이어마다 최소 2개 타일을 유지하고, 타일 x가 화면 왼쪽을 벗어나면 modulo 이동으로 seam 없이 재배치한다.
- transition은 현재/다음 scene의 같은 layer끼리 crossfade하며 220ms 또는 튜닝값을 사용한다.
- `transitionSprite.setTexture` 시 layer의 신규 asset key를 유지하고, 기존 scene asset을 세 레이어에 재사용하지 않는다.
- label은 배경 Graphics가 아니라 HUD-safe 위치의 별도 toast/depth로 표시한다. y=100에서 HUD와 겹치지 않도록 한다.

### I02. Remaining segment assets

- Related Files:
  - `public/assets/backgrounds/security-l0.png` ... `rooftop-l3.png` — new
  - `src/content/assets/gameAssets.ts` — all layered keys; modify
  - `scripts/validate-assets.mjs` — all layer files; modify
  - `src/content/backgroundSegments.test.ts`, `src/features/background/backgroundSceneResolver.test.ts`; modify

#### Details

- T09의 사무실 layer contract를 보안·도심·subway entrance/inside/exit·rooftop에 복제한다.
- 각 구간의 floor top pixel과 `floorY`를 검증한다.
- 기존 단일 PNG는 fallback 또는 migration asset으로 남기되 런타임 기본 경로로 사용하지 않는다.

### I03. Visual regression

- Related Files:
  - `screenshots/T10/` — 0, 1000, 2000, 3000, 3333, 3666, 4000m; new
  - `tests/e2e/playable-run.spec.ts` — background snapshots; modify

## Acceptance Criteria

- [ ] 모든 배경 레이어가 독립적으로 스크롤되고 원본 한 장의 삼중 겹침이 없다.
- [ ] 각 구간 전환에서 타일 seam·바닥선 단절·HUD 라벨 겹침이 없다.
- [ ] 3000~4000m에 지하철 entrance/inside/exit가 순서대로 나온다.
- [ ] `04-background-layers.png`와 비교한 캡처에서 L0~L3의 속도 차이가 확인된다.

## Validation

- `git pull --ff-only origin main`
- `npm run validate:assets && npm run typecheck && npm run lint`
- `npm run test:run -- src/content/backgroundSegments.test.ts src/features/background`
- `npm run test:e2e -- tests/e2e/playable-run.spec.ts --workers=1`

## Commit Message

```text
feat(background): rebuild parallax controller across distance segments

Plan: 2026-11-03-5pm-rush-game-feel
Phase: P05-background-reconstruction
Task: T10-background-controller-and-segments

- Scroll independent layered tiles without seams
- Extend the office layer contract through subway and rooftop segments
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: pending (현재 task 커밋에서 기록)
