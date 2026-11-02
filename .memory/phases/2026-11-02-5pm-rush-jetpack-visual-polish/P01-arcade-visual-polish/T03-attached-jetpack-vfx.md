# Task: T03 Attached Jetpack VFX

## Status: pending

## Goal

가방형 제트팩이 캐릭터의 등에서 실제로 불꽃을 분출하는 하나의 로컬 개체처럼 보이게 하고, 부스터 작동 시 같은 가방 위치의 로켓 폼으로 자연스럽게 변환한다. 상승/비행/부스터에는 배출구 불꽃·스파크가 보이고 하강/지면 RUN에는 꺼지며, frame마다 잔상 sprite를 만들지 않아 장시간 플레이에서도 누적 렌더링과 렉이 발생하지 않도록 한다.

## Decision Summary

- `PlayerEntity → JetpackAttachment → rocket/bag form + flame visual + spark emitter` 계층을 사용하고 월드 display list에 로켓/불꽃을 별도로 등록하지 않는다.
- `BoosterFlightController`의 이동 시간·속도·무적 규칙은 변경하지 않는다. VFX는 `setBoosting`, motion animation state, local anchor만 구독한다.

## Implementation

### I01. 불꽃 asset과 스타일 콘텐츠 계약

- Related Files:
  - `public/assets/player/jetpack-flame-spritesheet.png` :: 가방 배출구용 투명 불꽃 4-frame sprite sheet; new
  - `public/assets/player/booster-forms-spritesheet.png` :: 가방→로켓 변환 폼; modify only if current rocket frames need visual re-authoring
  - `src/content/assets/gameAssets.ts` :: `gameAssetKeys.jetpackFlame`, asset definitions; modify
  - `src/services/assetRegistry.ts` :: asset registry; read-only unless metadata is derived
  - `src/features/booster/boosterStyleTypes.ts` :: `BoosterStyleDefinition`, local VFX anchors; modify
  - `src/features/booster/boosterStyleCatalog.ts` :: `leather-rocket` default style; modify
  - `scripts/validate-assets.mjs` :: new required flame asset; modify

#### Details

- **Asset Contract**:
  - flame sheet는 `512×128 RGBA PNG`, `128×128` frame 4개이며 외부 alpha는 0이다. 불꽃은 배출구에서 시작하고 캐릭터 몸체나 화면 전체를 덮는 큰 aura를 포함하지 않는다.
  - `booster-forms-spritesheet.png`는 현재 `384×170` frame 폭을 유지하고, 로켓 폼은 얼굴/몸체를 다시 그린 독립 캐릭터가 아니라 가방이 변환된 후면 장치로 제작한다. 캐릭터 body와 중복되는 얼굴/모자 픽셀을 포함하지 않는다.
- **Signatures & Types**:
  ```typescript
  export interface BoosterVfxAnchor {
    flame: { x: number; y: number };
    sparks: { x: number; y: number };
  }

  export interface BoosterStyleDefinition {
    id: BoosterStyleId;
    displayName: string;
    textureKey: string;
    frameWidth: number;
    frameHeight: number;
    frameCount: number;
    frameStart: number;
    anchor: { x: number; y: number };
    vfx: BoosterVfxAnchor;
    scaleX: number;
    scaleY: number;
    coinPrice: number;
    defaultUnlocked: boolean;
  }
  ```
- 기본 `leather-rocket` style은 기존 `PLAYER_JETPACK_ANCHOR`를 유지하고, flame/spark anchor는 이 style metadata에 둔다. 이후 코인 상점이 추가되어도 `JetpackAttachment` 코드가 style id별 if/else를 갖지 않도록 한다.

### I02. JetpackAttachment 로컬 child와 flame state

- Related Files:
  - `src/features/player/JetpackAttachment.ts` :: `JetpackAttachment`, `BoosterFormMode`, `setBoosting`, `reset`; modify
  - `src/features/player/JetpackFlameVisual.ts` :: local flame animation wrapper; new
  - `src/features/player/JetpackSparkEmitter.ts` :: bounded local spark emitter; new
  - `src/features/player/PlayerEntity.ts` :: `setBoosting`, `updateMotionAnimation`, visual snapshot; modify
  - `src/game/scenes/BootScene.ts` :: flame animation registration; modify

#### Details

- **Required hierarchy**:
  ```text
  PlayerEntity
  ├─ JetpackAttachment (anchor = PLAYER_JETPACK_ANCHOR)
  │  ├─ formSprite (bag or leather-rocket child)
  │  ├─ JetpackFlameVisual (flame sheet child at style.vfx.flame)
  │  └─ JetpackSparkEmitter (bounded emitter at style.vfx.sparks)
  └─ player body sprite
  ```
- **Signatures & Types**:
  ```typescript
  export type JetpackActivity = 'off' | 'takeoff' | 'flying' | 'boosting';

  export class JetpackAttachment extends Phaser.GameObjects.Container {
    public setStyle(style: BoosterStyleDefinition): void;
    public setActivity(activity: JetpackActivity): void;
    public setGray(gray: boolean): void;
    public getVisualSnapshot(): BoosterFormVisualSnapshot & {
      flameVisible: boolean;
      flameParent: 'jetpack-attachment';
      sparkEmitterCount: number;
      hasPersistentTrail: false;
    };
    public reset(): void;
  }

  export class JetpackFlameVisual extends Phaser.GameObjects.Sprite {
    public setActive(active: boolean, intensity: 'normal' | 'strong'): void;
    public reset(): void;
  }
  ```
- `setActivity('takeoff'|'flying'|'boosting')`는 flame sprite를 visible하고 `player-jetpack-flame` animation을 재생한다. `takeoff/boosting`은 `normal`보다 scale/emit frequency를 키우되, 화면 폭을 가리는 persistent aura를 만들지 않는다. `setActivity('off')`는 animation stop, invisible, spark emitter stop으로 만든다.
- `setBoosting(true)`의 기존 morph tween(140ms)은 유지하되 formSprite가 `JetpackAttachment` 안에서만 보이게 하고, boost 종료 시 `transforming-out → normal` reset을 한 번만 실행한다. 중첩 호출은 tween을 kill하고 현재 상태를 기준으로 reset한다.
- 불꽃의 기준점은 style의 `vfx.flame` local coordinate이며 `PlayerEntity.x/y/angle/scale` 변화에 자동으로 따라간다. `scene.add.sprite`/`scene.add.particles`로 world root를 만들지 않는다.
- spark emitter는 최대 particle 12개, lifespan 120–220ms, speed/angle을 local nozzle 방향으로 제한한다. update loop에서 particle/image를 수동 생성하지 말고 하나의 emitter를 재사용한다. 종료/reset 시 `stop()`하고 scene destroy 시 한 번만 정리한다.
- 하강(`FALL`), 지면 RUN/LAND, HIT/DEAD에서는 flame과 spark를 끈다. 방어막/부스터 무적 효과 자체는 기존 controller 규칙을 따라가고 VFX가 collision result를 바꾸지 않는다.

### I03. 부스터/충돌 연결과 회귀 snapshot

- Related Files:
  - `src/game/scenes/RunScene.ts` :: motion/booster 상태를 PlayerEntity activity에 전달; modify
  - `src/features/booster/BoosterFlightController.ts` :: 이동 규칙; read-only unless a visual phase is exposed without changing values
  - `src/features/booster/BoosterController.ts` :: 5초/토큰 3개 activation; read-only
  - `src/features/player/__tests__/PlayerEntity.test.ts` :: local VFX state tests; modify
  - `src/features/booster/__tests__/boosterStyleCatalog.test.ts` :: style VFX anchor/asset registration; modify
  - `tests/e2e/booster.spec.ts` :: rocket/flame screenshot and detached-root guard; modify

#### Details

- RunScene은 `motion.grounded`, `keyboard.isThrusting()`, `flight.active`를 계산한 뒤 body animation과 별도로 `player.setJetpackActivity(...)` 또는 동등한 public API를 호출한다. 비행 중에는 FLY body와 flame이 동시에 보이고, `flight.active`가 끝나면 player x reset과 함께 rocket/flame local state도 reset된다.
- debug snapshot은 다음을 반환한다.
  ```typescript
  flameVisible: boolean;
  flameParent: 'jetpack-attachment';
  sparkEmitterCount: number; // bounded, no per-frame growth
  rocketFormVisible: boolean;
  rocketFormParent: 'player-entity';
  hasDetachedBoosterRoot: false;
  hasPersistentTrail: false;
  ```
- 단위 테스트는 activity별 flame visibility, style 변경 후 anchor 적용, reset 후 `sparkEmitterCount <= 12`/trail false를 확인한다. E2E는 부스터 중 rocket/flame이 한 화면에 붙어 보이는 screenshot을 남기고 5초 후 form/flame이 꺼지는지 확인한다.

## Acceptance Criteria

- [ ] 캐릭터·가방/로켓·불꽃·스파크가 하나의 PlayerEntity 계층으로 움직인다.
- [ ] 불꽃은 가방 배출구에서만 발생하며 TAKEOFF/FLY/BOOSTING에서 강해지고 FALL/RUN/LAND에서 꺼진다.
- [ ] 부스터 종료와 reset 후 detached rocket, persistent trail, 무한 emitter/particle이 남지 않는다.
- [ ] 기존 부스터 이동·무적·토큰 3개 activation 규칙은 변하지 않는다.

## Validation

- `npm run validate:assets` — flame/booster assets와 원본 사진 guard 통과.
- `npm run typecheck && npm run lint` — Phaser child/VFX 타입과 lint 통과.
- `npm run test:run -- src/features/player/__tests__/PlayerEntity.test.ts src/features/booster/__tests__/boosterStyleCatalog.test.ts src/features/booster/__tests__/BoosterFlightController.test.ts` — attachment/booster contracts 통과.
- `VITE_ENABLE_DEV_MOCK_AUTH=true npx playwright test tests/e2e/booster.spec.ts --workers=1` — rocket attached screenshot과 reset 통과.

## Commit Message

```text
feat(player): add attached jetpack flame and booster vfx

Plan: 2026-11-02-5pm-rush-jetpack-visual-polish
Phase: P01-arcade-visual-polish
Task: T03-attached-jetpack-vfx

- attach rocket form, flame animation, and bounded sparks to player
- prevent persistent booster trails and detached vfx roots
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
