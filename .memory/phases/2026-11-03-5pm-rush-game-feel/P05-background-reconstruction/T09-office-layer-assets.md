# Task: T09 사무실 L0~L3 레이어 에셋 제작

## Status: pending

## Goal

현재 한 장의 불투명한 사무실 PNG를 세 번 겹치는 구조를 폐기하고, `04-background-layers.png` 기준의 L0 하늘/조명, L1 원경, L2 벽 모듈, L3 바닥 스트립 투명 레이어를 제작한다. 첫 구간에서 타일 경계·중복 잔상·바닥선 불일치가 보이지 않아야 한다.

## Decision Summary

- D-G에 따라 사무실 구간만 먼저 제작하고, 나머지 구간은 동일 계약 검증 후 T10에서 확장한다.
- 에셋은 imagegen으로 투명 PNG를 생성하고, 기존 `office.png`는 fallback으로 보존한다.

## Implementation

### I01. Asset generation and manifest

- Related Files:
  - `public/assets/backgrounds/office-l0.png` ~ `office-l3.png` — 사무실 레이어; new
  - `src/content/assets/gameAssets.ts` :: `backgrounds`; modify
  - `src/content/backgroundLayers.ts` :: `BackgroundLayerDefinition`; modify
  - `scripts/validate-assets.mjs` :: background metadata; modify
  - `public/assets/backgrounds/CREDITS.md` — 생성·출처 기록; new/modify

#### Details

- 각 PNG는 1280×720 logical viewport에 반복 가능한 가로 모듈을 기준으로 제작한다.
- L0는 화면 전체에 반복 가능한 조명/천장, L1은 창밖 실루엣, L2는 벽/기둥 모듈, L3는 floorY에 맞는 바닥 스트립이다.
- L0~L2는 투명 배경을 유지하고 L3는 바닥 아래 영역만 불투명하게 채운다.
- 실제 게임 등록은 `background-office-l0` 등 고유 key를 사용하고 같은 이미지 세 장을 far/mid/near에 재사용하지 않는다.

### I02. Seam and floor contract

- Related Files:
  - `src/content/backgroundLayers.ts` :: layer definitions; modify
  - `src/features/background/__tests__/backgroundLayers.test.ts`; new
  - `screenshots/T09/` — 사무실 레이어 전후 비교; new

#### Details

- layer별 `repeatWidth`, `scrollFactor`, `depth`, `y`, `height`, `alpha`를 튜닝 파일 또는 background config에서 관리한다.
- L3의 top edge가 `GAME_CONFIG.floorY`와 정확히 맞아야 한다.
- 이미지 좌우 경계의 1px seam, 창문/기둥 단절을 pixel/visual check한다.
- 타일 자체에 플레이어·장애물·HUD를 포함하지 않는다.

## Acceptance Criteria

- [ ] 사무실에 L0~L3 네 레이어가 별도 asset key로 등록된다.
- [ ] 같은 그림의 far/mid/near 중복 겹침이 사라진다.
- [ ] 바닥 스트립이 실제 floorY에 맞고 타일 이음매가 보이지 않는다.
- [ ] 생성 에셋의 투명도·크기·반복 계약이 `validate-assets`에서 검사된다.

## Validation

- `git pull --ff-only origin main`
- `npm run validate:assets`
- `npm run typecheck && npm run lint`
- `npm run test:run -- src/features/background`
- `npm run dev -- --host 127.0.0.1` 후 사무실 1280×720 스크린샷 저장

## Commit Message

```text
feat(background): add layered office background assets

Plan: 2026-11-03-5pm-rush-game-feel
Phase: P05-background-reconstruction
Task: T09-office-layer-assets

- Replace repeated opaque office art with four transparent layers
- Add alpha, dimensions, and repeatability asset contracts
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
