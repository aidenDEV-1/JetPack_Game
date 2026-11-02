# Task: T01 Player Jetpack Composite

## Status: done ✅

## Goal

승인된 캐릭터 스프라이트의 갈색 가죽가방이 제트팩 본체가 되고, 가방 하단 배출구에서만 불꽃이 나오는 하나의 플레이어 시각 계층을 만든다. 캐릭터와 별개로 떠 있는 제트팩처럼 보이는 현재 배치를 없애고, 캐릭터 주변의 사각형 VFX가 플레이어 영역으로 오인되지 않게 하는 것이 목적이다.

## Decision Summary

- 얼굴·밀짚모자·가방이 포함된 기존 `player-spritesheet.png`를 유지하며, 가방을 별도 월드 sprite로 복제하지 않는다.
- 불꽃은 `PlayerEntity`의 child container인 `JetpackAttachment` 안에 두고, 월드 좌표가 아닌 캐릭터 로컬 좌표의 `PLAYER_JETPACK_ANCHOR`에 고정한다. 충돌 영역은 기존처럼 몸체만 계산한다.

## Implementation

### I01. 캐릭터 로컬 제트팩 attachment

- Related Files:
  - `src/features/player/JetpackAttachment.ts` :: `JetpackAttachment`, `JetpackAttachmentConfig` — 가방 배출구 불꽃을 캐릭터 child로 관리; new
  - `src/features/player/playerAssetConfig.ts` :: `PLAYER_JETPACK_ANCHOR`, `PLAYER_COLLISION_BOUNDS`, `PLAYER_SPRITE_SCALE` — anchor와 플레이어 크기 기준; modify
  - `src/features/player/PlayerEntity.ts` :: `PlayerEntity` constructor, `setAnimation`, `setBoosting`, `reset` — 기존 `flame`/`boostAura`/`boostTrail` 배치 교체; modify
  - `src/content/assets/gameAssets.ts` :: `gameAssetKeys.boosterVfxSheet` — 기존 VFX key 계약 확인; read-only
  - `src/features/player/playerTypes.ts` :: `PlayerVisualState` — 시각 상태 계약 확인; read-only

#### Details

- **Signatures & Types**:

  ```typescript
  export interface JetpackAnchor {
    x: number;
    y: number;
  }

  export interface JetpackAttachmentConfig {
    textureKey: string;
    flameFrame: number;
    anchor: JetpackAnchor;
    scaleX: number;
    scaleY: number;
  }

  export class JetpackAttachment extends Phaser.GameObjects.Container {
    public constructor(scene: Phaser.Scene, config: JetpackAttachmentConfig);
    public setActive(active: boolean): void;
    public setGray(gray: boolean): void;
    public reset(): void;
  }
  ```

- **Data & Visual Fields**:
  - `PLAYER_JETPACK_ANCHOR`: 캐릭터 sprite 원점 기준 가방 하단 배출구 위치. 초기값은 현재 `flame` offset `(-78, 18)`을 기준으로 삼되, 실제 sprite에서 가방에 붙어 보이도록 조정한다. anchor는 `PlayerEntity`가 아닌 `playerAssetConfig.ts`에서 관리한다.
  - `PLAYER_COLLISION_BOUNDS`: 기존 `{ x: -42, y: -30, width: 84, height: 68 }` 계약을 유지한다. 불꽃·VFX·warning indicator를 이 사각형에 포함하지 않는다.
  - `JetpackAttachment`는 불꽃 sprite 하나만 소유하고, `PlayerEntity`가 `this.add([jetpackAttachment, characterSprite])` 순서로 추가해 불꽃이 캐릭터 뒤에서 가방으로부터 뿜어져 나오게 한다.

- **Execution Flow / Logic**:
  1. Precondition & Validation: `gameAssetKeys.boosterVfxSheet`와 불꽃 frame 0이 BootScene에서 로드되는지 확인하고, anchor가 `PLAYER_COLLISION_BOUNDS`를 확장하지 않는지 검증한다.
  2. Core Processing: `PlayerEntity` 생성 시 `JetpackAttachment`를 같은 Container에 추가한다. `setBoosting(true)`는 attachment를 활성화하고, `setBoosting(false)`는 불꽃만 숨긴다. `PlayerEntity.x/y` 이동·부스터 우측 이동·충돌 tween은 attachment가 자동으로 따라가게 한다.
  3. Error & Exception Handling: texture/frame이 없을 때 새 월드 sprite를 만들거나 대체 사각형을 그리지 않는다. 기존 BootScene asset load error 흐름을 사용하고, 개발용 debug bounds 외에는 rectangle graphics를 렌더링하지 않는다.
  4. State Transition & Return: `reset()`은 attachment visibility, tint, alpha, scale을 초기 상태로 되돌리고 `getCollisionBounds()` 결과는 캐릭터 몸체만 반환한다.

### I02. 플레이어 영역 회귀 테스트

- Related Files:
  - `src/features/player/__tests__/PlayerEntity.test.ts` :: `PlayerAnimationController`/플레이어 visual state regression — modify or add focused test
  - `src/features/player/playerAnimations.ts` :: `reset` state contract — read-only unless T01 reset assertion requires a change

#### Details

- 테스트는 running/flying/boosting 전환 후 `gray === false`와 `boosting` 상태를 확인한다.
- `reset()` 후 fallen/gray 상태가 남지 않고 다시 running이 되는지 확인한다.
- collision bounds는 boost 여부와 무관하게 같은 몸체 크기이며, attachment 불꽃의 위치나 크기가 collision bounds를 변경하지 않는다는 순수 설정 테스트를 추가한다.

## Acceptance Criteria

- [ ] 캐릭터가 착용한 갈색 가죽가방에서 불꽃이 직접 나오는 것처럼 보이고, 불꽃이 캐릭터와 함께 이동한다.
- [ ] 캐릭터 주변에 사각형 배경/aura가 표시되지 않고, 플레이어 collision bounds가 불꽃·제트팩 잔여 영역을 포함하지 않는다.
- [ ] 승인된 얼굴·밀짚모자 디자인과 기존 running/flying/falling/crashing/fallen sprite animation이 변하지 않는다.
- [ ] `reset()`과 boosting on/off 이후 불꽃의 visibility/tint/alpha가 초기 상태로 복구된다.

## Validation

- `npm run test:run -- src/features/player` — 플레이어 animation/reset/bounds 테스트 통과
- `npm run typecheck` — `JetpackAttachment`와 `PlayerEntity` 타입 오류 없음
- `npm run lint` — 새 attachment 파일의 import·접근성 규칙 통과

## Commit Message

```text
refactor(player): attach jetpack flame to character bag

Plan: 2026-11-02-5pm-rush-visual-cohesion
Phase: P01-visual-cohesion-and-hazard-clarity
Task: T01-player-jetpack-composite

- anchor the jetpack flame to the approved leather-bag character sprite
- keep player visuals and collision bounds limited to the character body
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: refactor(player): attach jetpack flame to character bag
