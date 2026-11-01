# Task: T05 Collectible Field

## Status: pending

## Goal

`ItemEntity`를 화면에 실제로 생성하고 왼쪽으로 이동시키며, 플레이어 bounds와 겹칠 때 코인·방어막·DEX 토큰을 수집한다. 토큰은 사방으로 움직여 수집 난도가 있고, 방어막은 보유 중 중첩되지 않으며, 최소 1100m 이후에만 무작위로 드물게 등장해야 한다.

## Decision Summary

- 아이템 생성/수명/충돌은 `CollectibleField`가 관리하고, 개별 시각 표현은 `ItemEntity`가 관리한다. `RunScene`은 field의 event만 `GameState`/`BoosterController`에 반영한다.
- 아이템은 screen-space x를 줄이는 방식으로 이동한다. 토큰의 추가 궤적은 `movementPatterns.ts`에서 계산하며, floor/ceiling 밖으로 나가지 않게 clamp한다.

## Implementation

### I01. ItemEntity 실제 icon과 bounds

- Related Files:
  - `src/features/items/ItemEntity.ts` :: `ItemEntity` — colored Arc/text 제거, texture/icon/effect; modify
  - `src/features/items/itemTypes.ts` :: `ItemEntityContract`, `ItemKind`, `ItemPickupEvent` — event/bounds 계약; modify

#### Details

- 생성자는 기존 의미를 유지하되 asset key를 사용한다.

  ```typescript
  public constructor(
    scene: Phaser.Scene,
    kind: ItemKind,
    x: number,
    y: number,
    pattern?: TokenPattern,
  );
  public update(deltaMs: number, worldSpeed: number, elapsedMs: number): void;
  public getCollisionBounds(): Phaser.Geom.Rectangle;
  ```

- coin/shield/token마다 `item-coin`, `item-shield`, `item-token` texture를 사용하고, token에는 DEX 로고가 실제 이미지로 들어간다. token 회전은 icon 자체가 아니라 container animation으로 처리해 scale/jitter를 깨지 않게 한다.
- `collect()`는 한 번만 true를 반환하고 collect burst/tween 후 destroy 대기 상태로 둔다. `getCollisionBounds()`는 icon의 70~80% rectangle이다.

### I02. 생성·이동·수집 field

- Related Files:
  - `src/features/items/CollectibleField.ts` :: `CollectibleField`, `CollectibleFieldEvents` — spawn/update/collision 관리; new
  - `src/features/items/collectibleSpawn.test.ts` — spawn cadence/shield/token movement tests; new
  - `src/game/scenes/RunScene.ts` :: field 생성/update/events — modify
  - `src/game/state/GameState.ts` :: collect methods — T04 API 사용; modify if needed

#### Details

- 계약은 다음으로 고정한다.

  ```typescript
  export interface CollectibleFieldEvents {
    onCollect: (kind: ItemKind) => void;
    onShieldPickupSpawned: (distanceMeters: number) => void;
  }

  export class CollectibleField {
    public update(
      deltaMs: number,
      distanceMeters: number,
      worldSpeed: number,
      playerBounds: Phaser.Geom.Rectangle,
    ): void;
    public reset(): void;
    public hasShieldPickupAhead(): boolean;
  }
  ```

- coin cluster는 280~420m마다, token cluster는 500~900m마다 생성한다. y는 ceiling+55와 floor-55 사이에서 선택하고, cluster 간 x gap이 180px 이상이 되게 한다.
- 방어막은 `distanceMeters >= 1100`인 경우에만 생성 후보가 되고, 직전 방어막 생성/수집 후 최소 1200m cooldown을 둔다. `hasShield`가 true이면 새 방어막을 생성하지 않는다. 실제 위치는 무작위지만 field는 `onShieldPickupSpawned`로 “앞에 방어막이 존재함”을 장애물 spawner에 알린다.
- 각 update에서 아이템 x를 `worldSpeed * deltaSeconds`만큼 줄이고 token pattern을 적용한다. x가 -100보다 작거나 collect된 entity는 제거한다. player bounds와 item bounds가 겹치면 event를 한 번만 호출한다.
- `onCollect('token')`은 `BoosterController.collectToken()`으로 전달하고, `onCollect('shield')`는 `collectShield()`가 false면 inventory를 증가시키지 않는다. coin은 `GameState.collectCoin(1)`을 호출한다.

### I03. 수집 시각 피드백과 테스트 hook

- Related Files:
  - `src/features/items/ItemPickupFeedback.ts` :: 수집 burst/score popup — new
  - `src/game/scenes/RunScene.ts` :: dev-only demo spawn hook — modify

#### Details

- 수집 시 icon scale-up/fade와 작은 `+1`, `SHIELD`, `TOKEN` popup을 350ms 이내로 표시한다. 이 feedback은 collision state와 분리되어 animation이 끝나도 점수에는 영향이 없다.
- `import.meta.env.DEV`에서만 `window.__5PM_RUSH_TEST_API__.spawnDemoItems()`를 노출해 E2E가 실제 item render/collect를 결정적으로 확인할 수 있게 한다. production build에는 이 객체를 생성하지 않는다.

## Acceptance Criteria

- [ ] 플레이 중 코인·방어막·DEX 토큰이 실제 위치에 보이고 왼쪽으로 이동한다.
- [ ] 코인 수집 시 HUD runCoins가 증가하고, token 3개 수집 시 booster activation event가 발생한다.
- [ ] token이 정지하지 않고 vertical/horizontal/wave/orbit 중 하나로 움직인다.
- [ ] 방어막은 1100m 전에는 나오지 않고, 보유 중 중첩되지 않으며, 너무 짧은 간격으로 재생성되지 않는다.
- [ ] 수집 효과가 보이고, 수집 후 같은 아이템이 다시 점수를 주지 않는다.

## Validation

- `npm run test:run -- src/features/items` — pattern/cadence/duplicate collection tests 통과
- `npm run typecheck` — CollectibleField event 타입 일치
- `npm run test:e2e -- --grep "collectible|item|token"` — demo item 생성·수집 및 HUD 증가 확인

## Commit Message

```text
feat(items): spawn and collect visible run items

Plan: 2026-11-01-5pm-rush-playable-content
Phase: P02-playable-world-loop
Task: T05-collectible-field

- render moving coins, shield pickups, and DEX tokens
- enforce shield availability and non-stacking cooldown rules
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending

