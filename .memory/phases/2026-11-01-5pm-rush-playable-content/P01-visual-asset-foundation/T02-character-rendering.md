# Task: T02 Character Rendering

## Status: pending

## Goal

현재 `Ellipse`, `Arc`, `Rectangle`로 조립된 캐릭터를 T01의 sprite sheet 기반 캐릭터로 교체한다. 플레이 중에는 얼굴·안경·밀짚모자·갈색 가죽가방 제트팩이 하나의 일관된 일러스트처럼 보이고, 달리기·상승·하강·부스터·충돌·회색 쓰러짐 상태가 실제 애니메이션으로 구분되어야 한다.

## Decision Summary

- 시각용 sprite bounds와 충돌용 bounds를 분리한다. 밀짚모자와 불꽃의 넓은 투명 영역이 장애물 판정을 넓히지 않게 한다.
- `PlayerAnimationController`는 순수 상태 전이를 유지하고, `PlayerEntity`만 Phaser sprite animation과 이펙트를 적용한다.

## Implementation

### I01. Sprite 기반 PlayerEntity

- Related Files:
  - `src/features/player/PlayerEntity.ts` :: `PlayerEntity` — 도형 필드 제거, sprite/container 렌더링; modify
  - `src/features/player/playerTypes.ts` :: `PlayerConfig`, `PlayerVisualState` — sprite/collision 설정 확장; modify
  - `src/features/player/playerAssetConfig.ts` :: 상태별 animation key/bounds — new

#### Details

- `PlayerEntity`는 기존 외부 API를 유지한다.

  ```typescript
  public setAnimation(state: PlayerAnimation): void;
  public setBoosting(value: boolean): void;
  public getVisualState(): PlayerVisualState;
  public getCollisionBounds(): Phaser.Geom.Rectangle;
  public crash(): Promise<void>;
  ```

- 내부에는 `Phaser.GameObjects.Sprite`와 `Phaser.GameObjects.Image` 기반 flame/aura/trail을 두고 `scene.anims`에 등록된 `player-running`, `player-flying`, `player-falling`, `player-boosting`, `player-crashing`, `player-fallen`을 사용한다.
- `setAnimation`은 같은 상태에서 animation을 매 프레임 재시작하지 않는다. `crashing`은 1080도 회전 tween 후 `fallen`으로 전환하고, fallen 상태는 gray tint와 정지 frame을 유지한다.
- `setBoosting(true)`는 sprite animation, flame scale, aura visibility, trail emitter를 함께 활성화한다. `false`에서는 부스터용 이펙트만 끄고 현재 비행 상태는 유지한다.
- `getCollisionBounds()`는 플레이어 컨테이너의 world x/y를 기준으로 몸통 중심의 보수적인 직사각형을 반환한다. 모자와 불꽃은 bounds에서 제외한다.

### I02. Phaser animation 등록과 방향/바닥 상태 연결

- Related Files:
  - `src/game/scenes/BootScene.ts` :: `createPlayerAnimations` — spritesheet animations 등록; modify
  - `src/game/scenes/RunScene.ts` :: `update` — grounded/flying/falling 상태를 sprite state에 연결; modify
  - `src/features/player/__tests__/PlayerEntity.test.ts` :: state/gray/crash tests — modify

#### Details

- BootScene에서 animation key를 한 번만 등록하고, `frameRate`는 running/flying/falling 10~12fps, boosting 16fps, crashing 8fps로 둔다. 실제 frame count는 T01 manifest metadata에서 읽는다.
- 상단 경계에 닿으면 `updateRunMotion`의 bounce 결과만 반영하고 충돌/충돌 이벤트를 발생시키지 않는다. 바닥에서는 `running`을 사용하고, 키를 누를 때만 `flying`, 해제 후 상승 속도가 0 이하가 아니면 `falling`을 사용한다.
- `applyGray`는 도형별 fill 변경 대신 sprite tint/gray overlay를 사용하며, 모자·가방·flame까지 결과 화면에서 회색으로 통일한다.

## Acceptance Criteria

- [ ] 화면에서 도형 얼굴 대신 실제 일러스트 캐릭터가 보인다.
- [ ] 밀짚모자 아래 머리카락이 보이지 않고, 안경과 얼굴 특징이 일러스트에서 식별된다.
- [ ] 갈색 가죽가방 제트팩과 불꽃이 캐릭터 이동 상태에 맞춰 붙어 있다.
- [ ] 상태별 animation이 중복 재시작 없이 작동하고 충돌 후 gray/fallen 상태가 유지된다.
- [ ] 상단 경계는 튕김만 발생하고, 바닥에서는 달리기 모션이 보인다.

## Validation

- `npm run test:run -- src/features/player` — player animation/controller tests 통과
- `npm run typecheck` — PlayerEntity와 Phaser animation 타입 오류 없음
- `npm run build` — spritesheet asset loading 포함 build 성공
- `npm run test:e2e -- --grep "player|run"` — mock 로그인 후 실제 canvas에 캐릭터 렌더링

## Commit Message

```text
feat(player): replace placeholder avatar with illustrated sprite states

Plan: 2026-11-01-5pm-rush-playable-content
Phase: P01-visual-asset-foundation
Task: T02-character-rendering

- render the face-reference character with hat and leather jetpack
- separate visual animation from collision bounds and crash tinting
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending

