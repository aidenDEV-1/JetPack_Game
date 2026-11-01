# Task: T05 Player and Jetpack

## Status: done

## Goal
사진 기반 얼굴 특징을 가진 캐릭터, 밀짚모자, 갈색 가죽가방 제트팩을 독립 레이어와 애니메이션 상태로 구현한다.

## Decision Summary
- 원본 사진은 배포하지 않고, 사진을 기반으로 스타일을 맞춘 고해상도 일러스트 에셋만 사용한다.
- 캐릭터·모자·가죽가방·불꽃은 교체 가능한 에셋 키와 컴포넌트로 분리한다.

## Implementation

### I01. Asset registry and player entity
- Related Files:
  - `src/content/assets/playerAssets.ts` — asset keys and paths; new
  - `src/features/player/PlayerEntity.ts` — composite player; new
  - `src/features/player/playerTypes.ts` — states and config; new

#### Details
- **Types**:
  ```typescript
  export type PlayerAnimation = 'running' | 'flying' | 'falling' | 'boosting' | 'crashing' | 'fallen';
  export interface PlayerConfig { x: number; floorY: number; maxHeightY: number; scale: number; }
  export interface PlayerEntity { setAnimation(state: PlayerAnimation): void; setBoosting(value: boolean): void; getBounds(): Phaser.Geom.Rectangle; crash(): Promise<void>; }
  ```
- Compose body/face, hat, bag jetpack, flame, boost aura as separate sprites or layers so each can be replaced.
- Preserve glasses, face shape, eyes, nose, mouth, and expression from the supplied photo while hiding hair under the straw hat.

### I02. Animation and crash sequence
- Related Files:
  - `src/features/player/playerAnimations.ts` — animation definitions; new
  - `src/features/player/__tests__/PlayerEntity.test.ts` — state tests; new

#### Details
- Running: feet cycle, flame hidden. Flying/falling: bag flame changes by thrust. Boosting: forward pose, high flame, aura.
- Crash sequence: rotate several turns, fall to floor, desaturate/gray tint, then resolve a promise for results transition.
- Ensure crash animation cannot be triggered twice.

## Acceptance Criteria
- [ ] All player visual parts are independently replaceable.
- [ ] Hair is not visible under the hat.
- [ ] Ground/fly/fall/boost/crash states change without changing gameplay logic.
- [ ] Crash sequence ends in gray fallen state before results screen.

## Validation
- `npm run test:run -- src/features/player` — state transition tests pass.
- Manual screenshot review at 1280x720 for face-to-cartoon visual consistency.

## Commit Message
```text
feat(player): add illustrated character and leather jetpack

Plan: 2026-11-01-dex-escape-5pm-rush
Phase: P02-gameplay-core
Task: T05-player-and-jetpack

- compose photo-inspired face, straw hat, and leather bag jetpack
- add flight, running, boost, and crash animation states
```

## Progress
- [x] 구현 완료
- [x] 검증 통과
- commit: pending
