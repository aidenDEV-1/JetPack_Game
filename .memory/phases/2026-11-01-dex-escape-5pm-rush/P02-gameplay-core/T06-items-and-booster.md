# Task: T06 Items and Booster

## Status: pending

## Goal
코인·방어막·DEX 토큰 수집과 토큰 3개 소모형 5초 부스터를 구현한다.

## Decision Summary
- DEX 토큰은 정지하지 않고 정의된 패턴을 무작위로 선택해 이동한다.
- 방어막은 1회 충돌 방어이며 중첩되지 않고, 최소 1,100m 간격으로 등장한다.

## Implementation

### I01. Item entities and movement patterns
- Related Files:
  - `src/features/items/itemTypes.ts` — item and pattern types; new
  - `src/features/items/ItemEntity.ts` — collectible entity; new
  - `src/features/items/movementPatterns.ts` — sine, horizontal, diagonal, orbit; new
  - `src/content/assets/itemAssets.ts` — coin/shield/DEX keys; new

#### Details
- **Types**:
  ```typescript
  export type ItemKind = 'coin' | 'shield' | 'token';
  export type TokenPattern = 'vertical' | 'horizontal' | 'wave' | 'orbit';
  export interface ItemEntity { kind: ItemKind; pattern?: TokenPattern; collect(): void; isCollected(): boolean; }
  export interface ItemInventory { runCoins: number; tokenCount: number; hasShield: boolean; }
  ```
- DEX token uses the supplied `DEX.` logo inside a circular high-contrast token asset.
- Collision with a collected item disables it once and emits `item-collected`.

### I02. Booster controller
- Related Files:
  - `src/features/booster/BoosterController.ts` — activation and timer; new
  - `src/features/booster/boosterTypes.ts` — state; new
  - `src/features/booster/__tests__/BoosterController.test.ts` — tests; new

#### Details
- **API**:
  ```typescript
  export interface BoosterController { startInitial(): void; collectToken(): void; activate(): void; tick(deltaMs: number): void; isInvincible(): boolean; isActive(): boolean; }
  ```
- Start booster: activate at run start for 5,000ms. Token booster: increment token count; when count reaches 3, reset to 0 and activate for 5,000ms.
- While active, player is invincible and moves toward the right side; before expiry, tween back to the left anchor.
- Shield pickup is ignored when `hasShield=true`; it must not stack.

## Acceptance Criteria
- [ ] Coins increment runCoins once per pickup.
- [ ] Token patterns are selected from the four defined patterns and are deterministic under a seeded test RNG.
- [ ] Three tokens consume to zero and activate exactly one 5-second booster.
- [ ] Shield cannot stack and can absorb exactly one collision.
- [ ] Booster makes the player invincible for its full active interval.

## Validation
- `npm run test:run -- src/features/items src/features/booster` — item and timer tests pass.
- Manual run verifies initial booster and token-triggered booster behavior.

## Commit Message
```text
feat(items): add collectibles shields tokens and booster

Plan: 2026-11-01-dex-escape-5pm-rush
Phase: P02-gameplay-core
Task: T06-items-and-booster

- add moving DEX token patterns and shield inventory
- trigger five-second invincible booster on start and three tokens
```

## Progress
- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
