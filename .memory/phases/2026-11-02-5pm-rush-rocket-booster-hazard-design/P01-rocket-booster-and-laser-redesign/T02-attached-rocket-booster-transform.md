# Task: T02 Attached Rocket Booster Transform

## Status: pending

## Goal

부스터가 시작될 때 화면에 별도 로켓 오브젝트가 나타나는 대신, 플레이어가 메고 있는 갈색 가방 위치에서 로켓 shell과 불꽃이 점화되고 가방이 로켓형으로 변환되는 연출을 구현한다. 부스터가 끝나거나 충돌하면 로켓 child가 즉시 사라지고, 기존 캐릭터의 이동·충돌·무적·부스터 비행 위치는 그대로 유지한다.

## Decision Summary

- `JetpackAttachment`를 단순 flame sprite가 아닌 플레이어 로컬 `BoosterFormAttachment`로 확장한다. 로켓 form, 점화 불꽃, 변환 상태는 모두 `PlayerEntity`의 child container 안에만 존재한다.
- 기본 스타일은 T01의 `getBoosterStyle(DEFAULT_BOOSTER_STYLE_ID)`에서 읽고, `PlayerEntity`와 `RunScene`에는 특정 로켓 에셋 key를 하드코딩하지 않는다.

## Implementation

### I01. 플레이어 로컬 로켓 변환 계층

- Related Files:
  - `src/features/player/JetpackAttachment.ts` :: `JetpackAttachment`, `JetpackAttachmentConfig`, `setBoosting`, `reset` — 기존 flame-only child를 가방 변환 form child로 확장; modify
  - `src/features/player/playerAssetConfig.ts` :: `PLAYER_JETPACK_ANCHOR`, `PLAYER_COLLISION_BOUNDS`, optional `PLAYER_BOOSTER_FORM_OFFSET` — 가방 mount/pivot 기준을 중앙 관리; modify only if the T01 asset requires a measured offset
  - `src/features/booster/boosterStyleTypes.ts` :: `BoosterStyleDefinition` — attachment가 읽는 style contract; read-only
  - `src/features/booster/boosterStyleCatalog.ts` :: `getBoosterStyle`, default style — 현재 선택 스타일 제공; read-only
  - `src/content/assets/gameAssets.ts` :: `gameAssetKeys.boosterFormsSheet`, legacy `boosterVfxSheet` — 새 form key 사용 및 기존 detached rocket/trail sheet runtime 등록 제거; modify
  - `src/content/assets/playerAssets.ts` :: legacy `boosterVfxSheet` description — 새 form asset으로 교체된 legacy key 제거; modify
  - `public/assets/ui/booster-vfx-spritesheet.png` :: 기존 detached rocket/aura/trail sheet — T02에서 runtime 참조가 없는 것을 확인한 뒤 제거; delete

#### Details

- **Signatures & Types**:

  ```typescript
  export type BoosterFormMode = 'normal' | 'transforming-in' | 'boosting' | 'transforming-out';

  export interface JetpackAttachmentConfig {
    style: BoosterStyleDefinition;
    anchor: { x: number; y: number };
  }

  export interface BoosterFormVisualSnapshot {
    styleId: BoosterStyleId;
    mode: BoosterFormMode;
    rocketFormVisible: boolean;
    rocketFormParent: 'player-entity';
    hasDetachedBoosterRoot: false;
  }

  public setStyle(style: BoosterStyleDefinition): void;
  public setBoosting(active: boolean): void;
  public setGray(gray: boolean): void;
  public getVisualSnapshot(): BoosterFormVisualSnapshot;
  public reset(): void;
  ```

- **Child hierarchy**:

  ```text
  PlayerEntity
  ├─ JetpackAttachment (local anchor at bag outlet)
  │  ├─ normalFlame / ignition glow (optional, no world root)
  │  └─ boosterFormSprite (rocket shell + integrated flame)
  └─ characterSprite (face, hat, body, normal leather bag)
  ```

  `boosterFormSprite`는 `scene.add.existing()` 후 Scene display list에 독립적으로 남겨두지 말고, `JetpackAttachment.add()`로만 parent에 연결한다. `PlayerEntity`를 이동·부스터 outbound/hold/return tween·crash rotation할 때 로켓이 같은 transform을 상속해야 한다.

- **Execution Flow / Logic**:
  1. Precondition & Validation: `style.textureKey`와 frame 범위가 registry에 있고, `style.anchor`가 `PLAYER_COLLISION_BOUNDS`를 몸체 쪽으로 확장하지 않는지 확인한다. T01의 transparent overlay frame 0이 mount 기준에서 준비되어 있어야 한다.
  2. Core Processing: 생성 시 `boosterFormSprite`를 style의 frame 0으로 만들고 hidden 상태로 둔다. `setBoosting(true)`가 호출되면 기존 normal flame을 fade out하고 form frame 0을 같은 anchor에서 visible로 만든 뒤 frame 1→3을 재생한다. `setBoosting(false)`는 animation/tween을 kill하고 form을 즉시 hidden/reset하여 다음 run에 남는 잔상을 만들지 않는다.
  3. Morph Detail: 변환 시간은 `150ms` 이내로 제한한다. form sprite의 alpha/scale을 `0→1`로 올리되 x/y anchor는 고정한다. 캐릭터 base sprite의 가죽가방이 form shell 아래에 비치지 않도록 overlay가 가방 영역을 덮고, form이 캐릭터 오른쪽에 떠 보이는 offset은 허용하지 않는다.
  4. Error & Exception Handling: style/texture가 없으면 새 사각형 placeholder나 detached rocket을 생성하지 않고 기존 asset load error를 유지한다. 부스터 재활성화 중에는 새로운 child를 추가하지 않고 같은 `boosterFormSprite`를 reset/replay한다.
  5. State Transition & Return: `normal → transforming-in → boosting → transforming-out → normal`을 따르며 `crash()`와 `reset()`은 어느 상태에서도 `normal`로 수렴한다. `getVisualSnapshot().hasDetachedBoosterRoot`는 항상 `false`여야 한다.

### I02. PlayerEntity·게임 루프 연결

- Related Files:
  - `src/features/player/PlayerEntity.ts` :: constructor, `setAnimation`, `setBoosting`, `crash`, `reset`, `getVisualDebugSnapshot` — default style 주입과 local rocket form lifecycle 연결; modify
  - `src/game/scenes/RunScene.ts` :: player creation/update and booster activation paths — 기존 `setBoosting` 호출만 유지하고 asset logic을 추가하지 않음; modify only if a visual update hook is required
  - `src/features/booster/BoosterFlightController.ts` :: `activate`, `update`, `reset` — 플레이어 x outbound/return 규칙 확인; read-only
  - `src/features/booster/BoosterController.ts` :: `activate`, `collectToken`, `reset` — 토큰 3개·초기 부스터 규칙 확인; read-only

#### Details

- `PlayerEntity` 생성자는 `getBoosterStyle(DEFAULT_BOOSTER_STYLE_ID)`를 읽고 `JetpackAttachment`에 전달한다. `RunScene`은 `booster-vfx-spritesheet` frame 0을 직접 참조하지 않는다. `rg`로 legacy key의 다른 참조가 없음을 확인한 뒤 T02에서 registry와 파일을 함께 제거해 옛 detached rocket/trail asset이 runtime에 다시 로드되지 않게 한다.
- 기존 `RunScene.update()`의 `this.player.setBoosting(flight.active)` 호출은 유지한다. `BoosterFlightController`의 outbound/hold/return 단계와 `PlayerEntity.x` 변경은 그대로 두고, attachment가 parent transform을 따라가는지만 검증한다.
- 부스터 시작 경로는 초기 시작과 토큰 3개 수집 모두 동일한 `setBoosting(true)` 상태 전이를 사용한다. 부스터가 끝나면 `setBoosting(false)`가 호출되어 로켓 form과 점화 glow가 사라진다.
- 충돌 시 `PlayerEntity.crash()`가 변환 animation을 중단하고 로켓 form을 숨긴 뒤 기존 1080도 회전·gray fallen 결과로 이어진다. 충돌 영역은 `PLAYER_COLLISION_BOUNDS` `{ x: -42, y: -30, width: 84, height: 68 }`를 유지한다.
- 기존 `hasPersistentTrail: false` 계약을 유지한다. 프레임마다 trail sprite를 생성하지 않고, 현재 form sprite 하나의 frame/visibility/alpha만 갱신한다.

### I03. 플레이어 시각 상태 회귀 테스트

- Related Files:
  - `src/features/player/__tests__/PlayerEntity.test.ts` :: attachment/bounds invariant — local style and collision contract assertions; modify
  - `tests/e2e/booster.spec.ts` :: real canvas booster visual behavior — rocket parent, form visibility, no trail, reset state; modify
  - `src/game/test/GameTestApi.ts` :: `getPlayerVisualSnapshot` return contract — debug-only fields; modify
  - `src/game/scenes/RunScene.ts` :: `registerDevTestApi` — debug snapshot exposure; modify only for new fields

#### Details

- Unit tests는 스타일 catalog가 반환한 `leather-rocket`을 attachment가 사용하며, booster on/off/reset 후 child count가 증가하지 않는지 검증한다.
- E2E는 mock 로그인 후 run을 시작하고 `activateBooster()`를 호출한다. 다음 snapshot을 확인한다.
  - `rocketFormVisible: true` during booster
  - `rocketFormParent: 'player-entity'`
  - `hasDetachedBoosterRoot: false`
  - `hasPersistentTrail: false`
  - collision width/height remains `84×68`
- booster를 deactivate하거나 duration 종료까지 기다린 뒤 `rocketFormVisible: false`, mode `normal`, child count stable을 확인한다.
- outbound/return 중 player x가 변해도 snapshot의 parent contract와 anchor가 유지되는지 확인하고, 충돌 후 gray fallen 결과 panel이 기존대로 나타나는지 회귀한다.

## Acceptance Criteria

- [ ] 부스터 시작 시 로켓이 캐릭터와 별개로 둥둥 떠 있지 않고, 기존 가방 위치에서 로켓 shell과 불꽃으로 변환된다.
- [ ] 초기 부스터와 토큰 3개 부스터가 동일한 변환 연출을 사용한다.
- [ ] 부스터 종료·충돌·재시작 후 로켓 child, 불꽃, 잔상 object가 남지 않는다.
- [ ] 미래 `BoosterStyleId` 교체 지점은 catalog/attachment에 있고, 현재 코인 차감이나 구매 로직은 추가되지 않는다.
- [ ] 플레이어 충돌 bounds와 부스터 무적·비행 위치 규칙은 기존과 동일하다.

## Validation

- `npm run test:run -- src/features/player src/features/booster` — player/booster controller와 attachment 관련 단위 테스트 통과.
- `VITE_ENABLE_DEV_MOCK_AUTH=true npx playwright test tests/e2e/booster.spec.ts --workers=1` — 실제 canvas에서 로켓 변환·parent·reset·잔상 회귀 통과.
- `npm run typecheck && npm run lint` — attachment/style 타입과 Phaser child lifecycle 오류 없음.

## Commit Message

```text
feat(player): transform leather bag into attached rocket booster

Plan: 2026-11-02-5pm-rush-rocket-booster-hazard-design
Phase: P01-rocket-booster-and-laser-redesign
Task: T02-attached-rocket-booster-transform

- morph the local bag attachment into a selectable rocket form
- keep booster visuals attached to PlayerEntity without trails or detached roots
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
