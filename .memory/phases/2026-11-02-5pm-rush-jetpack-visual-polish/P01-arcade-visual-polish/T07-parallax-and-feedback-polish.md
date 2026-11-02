# Task: T07 Parallax and Feedback Polish

## Status: pending

## Goal

기존 3중 background scroll을 실제 횡스크롤 액션 게임처럼 느끼게 보강하고, 달리기 먼지·착지 충격·코인 획득 sparkle/pop·레이저 spark·드론 부유·충돌 폭발/화면 흔들림을 현재 게임 루프에 연결한다. 모든 연출은 캐릭터 실루엣을 흐리지 않고 pooled/reusable 방식으로 동작하며, 기존 아이템/거리/충돌 결과를 바꾸지 않는다.

## Decision Summary

- 배경 이동은 `BackgroundController`가 계속 소유하고 far/mid/near scroll factors를 유지한다. scene 전환은 즉시 깜빡이기보다 짧은 crossfade 또는 동일 tile 경계 보정으로 연결한다.
- feedback은 새 world trail을 만들지 않는다. 제한된 `RunEffects`/particle emitter가 짧은 burst만 재사용하고, `scene.add.*`를 update loop마다 호출하지 않는다.

## Implementation

### I01. background parallax와 scene transition

- Related Files:
  - `src/features/background/BackgroundController.ts` :: tile scroll/applyScene/reset; modify
  - `src/content/backgroundLayers.ts` :: far/mid/near layer definitions; modify
  - `src/content/backgroundSegments.ts` :: existing segment boundaries; read-only unless naming-only visual metadata is needed
  - `src/game/scenes/RunScene.ts` :: background update and reset; modify only for effect lifecycle
  - `src/features/background/backgroundSceneResolver.test.ts` :: 0/1000/2000/3000/4000 boundaries; read-only/modify tests if transition snapshot added

#### Details

- **Signatures & Types**:
  ```typescript
  export interface BackgroundTransitionSnapshot {
    scene: BackgroundSceneKey;
    segment: number;
    transitionProgress: number;
  }

  export class BackgroundController {
    public update(deltaMs: number, worldSpeed: number, distanceMeters: number): void;
    public getTransitionSnapshot(): BackgroundTransitionSnapshot;
    public reset(): void;
  }
  ```
- 기존 repeatWidth 1280, two-tile wrapping 방식은 유지하되, 각 layer의 `scrollFactor`는 far 0.18, mid 0.42, near 0.75보다 급격히 커지지 않게 한다. near가 player/obstacle와 혼동되는 불투명 foreground가 되지 않도록 alpha를 확인한다.
- 1000m/2000m/3000m/4000m scene boundary에서 texture 교체가 한 frame에 번쩍이지 않도록 180–260ms alpha crossfade 또는 tile-level transition을 적용한다. 3000–4000m의 subway entrance/inside/exit resolver는 그대로 유지한다.
- background tile에는 캐릭터/장애물과 같은 energy glow를 굽지 않는다. player와 obstacle contrast가 떨어지면 background tint/alpha만 조정한다.

### I02. pooled run/landing/pickup/crash effects

- Related Files:
  - `src/features/effects/RunEffects.ts` :: pooled visual effect coordinator; new
  - `src/game/scenes/RunScene.ts` :: lifecycle and event calls; modify
  - `src/features/items/ItemPickupFeedback.ts` :: coin/shield/token popup and sparkle; modify
  - `src/features/items/ItemEntity.ts` :: item collect position/rotation compatibility; modify only if a pickup anchor is needed
  - `src/features/booster/BoosterFeedback.ts` :: boost activation feedback; modify
  - `src/features/player/PlayerEntity.ts` :: ground/landing effect anchor snapshot; modify only if needed

#### Details

- **Signatures & Types**:
  ```typescript
  export class RunEffects {
    public constructor(scene: Phaser.Scene);
    public update(deltaMs: number): void;
    public emitRunDust(x: number, y: number): void;
    public emitLanding(x: number, y: number): void;
    public emitPickup(kind: ItemKind, x: number, y: number): void;
    public emitCrash(x: number, y: number): void;
    public destroy(): void;
  }
  ```
- run dust는 `motion.grounded`이고 thrust가 false인 동안 180–260ms cooldown으로만 발생시킨다. `FALL`/`FLY` 중에는 발밑 dust를 만들지 않는다.
- landing burst는 floor transition false→true 때 한 번, coin/token/shield pickup은 작은 ring/scale pop + 짧은 text만 표시한다. 기존 `onCollect`가 coin count/token count/shield state를 변경하는 순서는 그대로 둔다.
- crash effect는 player 위치에서 1회 explosion burst와 `this.cameras.main.shake(220, 0.006)` 수준의 짧은 shake만 실행한다. `PlayerEntity.crash()`의 회전/결과 저장을 대체하지 않는다.
- 모든 emitter는 pool size를 고정(예: dust 12, pickup 8, crash 16)하고 `lifespan <= 500ms`로 제한한다. afterimage/ghost/trail 이름의 object를 생성하지 않고 update당 sprite를 누적하지 않는다.
- `RunScene.shutdown()`/restart에서 `RunEffects.destroy/reset`를 호출한다. paused 상태에서는 effect timer가 게임 pause와 함께 멈추거나 update를 건너뛴다.

### I03. effect visual regression

- Related Files:
  - `src/features/items/ItemPickupFeedback.ts` :: feedback tests or pure helper extraction; modify
  - `src/features/booster/BoosterFeedback.ts` :: activation cleanup; modify
  - `src/features/background/backgroundSceneResolver.test.ts` :: segment continuity; modify only if needed
  - `tests/e2e/collectible.spec.ts` :: collect feedback/coin state; modify
  - `tests/e2e/results.spec.ts` :: crash effect/result transition; modify
  - `tests/e2e/playable-run.spec.ts` :: parallax/booster/effect combined screenshot; modify

#### Details

- E2E는 coin/token/shield pickup 후 popup/effect object가 일정 시간 뒤 제거되고 HUD 수치만 정확히 증가하는지 확인한다.
- crash 후 effect가 결과 panel을 가리지 않고, player gray/dead와 기록 save가 기존 시간 안에 끝나는지 확인한다.
- background test는 segment resolver boundary에서 scene key가 유지되고 2-tile wrap 뒤 빈 틈이 생기지 않는지 검증한다.

## Acceptance Criteria

- [ ] far/mid/near background가 끊김 없이 왼쪽으로 이동하고 segment 전환에서 번쩍임/빈틈이 없다.
- [ ] run dust, landing, pickup, laser/booster feedback, crash shake가 보이되 캐릭터 실루엣을 흐리는 trail/blur가 없다.
- [ ] effects가 장시간 실행에서 매 frame 객체를 무한 생성하지 않고 reset/shutdown 시 정리된다.
- [ ] 아이템 수집, 부스터, 충돌, 결과 저장과 distance/coin 계산이 그대로 동작한다.

## Validation

- `npm run typecheck && npm run lint` — effects/background lifecycle 타입과 lint 통과.
- `npm run test:run -- src/features/background/backgroundSceneResolver.test.ts src/features/items/collectibleSpawn.test.ts src/features/items/movementPatterns.test.ts` — parallax/collectible logic 통과.
- `VITE_ENABLE_DEV_MOCK_AUTH=true npx playwright test tests/e2e/collectible.spec.ts tests/e2e/results.spec.ts tests/e2e/playable-run.spec.ts --workers=1` — pickup/effect/crash regression 통과.
- `git diff --check` — effect asset/code patch 오류 없음.

## Commit Message

```text
feat(game): add pooled arcade feedback and parallax polish

Plan: 2026-11-02-5pm-rush-jetpack-visual-polish
Phase: P01-arcade-visual-polish
Task: T07-parallax-and-feedback-polish

- smooth background transitions and reinforce layered parallax
- add bounded dust, pickup, landing, and crash feedback without trails
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
