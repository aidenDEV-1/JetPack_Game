# Task: T03 Parallax Background

## Status: done

## Goal

`BackgroundController`의 단색 Rectangle 배경을 실제 이미지 타일 3개 레이어로 교체하고, 배경이 오른쪽에서 왼쪽으로 계속 반복되면서 1000m마다 스타일이 체감되게 바뀌도록 한다. 3000~4000m에는 지하철 진입·내부·지상 탈출을 순서대로 보여준다.

## Decision Summary

- 화면 너비보다 큰 2-tile per layer 구조를 유지하고, 각 타일은 월드 속도×레이어별 scroll factor만큼 이동한 뒤 반대쪽 끝으로 재배치한다.
- 배경 장면 판정은 순수 함수로 분리해 거리 테스트가 가능하게 한다. segment label을 매번 새로 추가하지 않고 단일 text node를 갱신한다.

## Implementation

### I01. 장면/레이어 모델

- Related Files:
  - `src/content/backgroundSegments.ts` :: `BackgroundSegment`, `resolveBackgroundScene` — 거리별 5구간 및 지하철 sub-scene; modify
  - `src/content/backgroundLayers.ts` :: `BackgroundLayerDefinition` — layer별 asset key/깊이/속도; modify
  - `src/features/background/backgroundSceneResolver.test.ts` — 0/1000/2000/3000/3500/4000 경계 테스트; new

#### Details

- `resolveBackgroundScene(distanceMeters)`의 계약은 다음과 같다.

  ```typescript
  export type BackgroundSceneKey =
    | 'office' | 'security' | 'city'
    | 'subway-entrance' | 'subway-inside' | 'subway-exit'
    | 'rooftop';

  export function resolveBackgroundScene(distanceMeters: number): BackgroundSceneKey;
  ```

- 음수 거리는 `office`, 0~999.999는 `office`, 1000~1999.999는 `security`, 2000~2999.999는 `city`, 3000~4000 구간은 진행률 0~0.33/0.33~0.66/0.66~1로 각각 entrance/inside/exit, 4000 이상은 `rooftop`으로 결정한다.
- `BackgroundLayerDefinition`은 최소 `id`, `depth`, `repeatWidth`, `scrollFactor`, `assetKeyByScene`, `height`, `y`를 가진다. 각 layer의 asset key는 far/mid/near가 서로 달라야 한다.

### I02. 이미지 타일 렌더링

- Related Files:
  - `src/features/background/BackgroundController.ts` :: `BackgroundController` — Rectangle 제거, Image tile 생성/전환/무한 이동; modify
  - `src/game/scenes/RunScene.ts` :: 배경 초기화 및 update 호출 — modify

#### Details

- 내부 tile 타입을 `Phaser.GameObjects.Image`와 `x`로 바꾸고, 각 레이어에 `repeatWidth` 크기의 두 tile을 둔다. `update(deltaMs, worldSpeed, distanceMeters)`가 현재 scene을 계산하고, 바뀐 경우 각 tile에 `setTexture(assetKey)`를 호출한다.
- 이동식 `floorLine`은 foreground 이미지와 겹치지 않도록 depth를 고정한다. 게임 화면 전체를 덮을 수 없는 경우에도 빈 틈이 생기지 않도록 타일을 폭의 2배로 배치한다.
- segment 전환 시 기존 text를 파괴하지 말고 `private segmentLabel?: Phaser.GameObjects.Text` 하나만 `setText`/`setPosition`으로 갱신한다. 디버그용 라벨은 production 화면에서 숨기거나 작은 pill로 제한한다.
- 이미지 로딩 실패 시 단색 fallback은 허용하되, 초기화 완료를 막는 silent failure는 허용하지 않는다. BootScene의 에셋 오류 상태가 사용자에게 전달되어야 한다.

## Acceptance Criteria

- [ ] 게임 시작 후 배경이 빈 단색이 아니라 far/mid/near 실제 이미지로 보인다.
- [ ] 10초 이상 플레이해도 각 레이어의 이음새/검은 빈 공간/타일 정지가 없다.
- [ ] 1000m, 2000m, 3000m, 4000m에서 장면 스타일이 바뀌고, 3000~4000m 하위 장면이 순서대로 전환된다.
- [ ] 기존 2000~3000m 도심, 3000~4000m 지하철 요구사항이 보존된다.

## Validation

- `npm run test:run -- src/features/background/backgroundSceneResolver.test.ts` — 경계/음수/지하철 sub-scene 테스트 통과
- `npm run typecheck` — Phaser Image tile 타입 오류 없음
- `npm run test:e2e -- --grep "background|run"` — 실행 중 canvas에 배경이 렌더링되고 1000m 이후 장면이 변경됨

## Commit Message

```text
feat(background): add looping parallax segment scenes

Plan: 2026-11-01-5pm-rush-playable-content
Phase: P01-visual-asset-foundation
Task: T03-parallax-background

- replace flat rectangles with three looping image layers
- switch office, city, subway, and rooftop scenes by distance
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: pending

