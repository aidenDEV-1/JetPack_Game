# Task: T12 퇴근 동료 NPC와 월드 피드백

## Status: done

## Goal

바닥에 퇴근하는 동료 NPC를 배경 장식으로 추가하고, 플레이어의 제트팩 분사·착지 근처에서 놀라거나 피하는 짧은 반응을 보여준다. NPC는 어떤 경우에도 충돌 판정·거리 차단·기록에 영향을 주지 않아야 한다.

## Decision Summary

- NPC는 visual-only entity이며 `ObstacleField`, `CollisionResolver`, shield/booster logic에 등록하지 않는다.
- 캐릭터 얼굴/브랜드 표현은 기존 주인공과 구분되는 단순 실루엣 또는 회사원 일러스트로 관리한다.

## Implementation

### I01. NPC entity and asset contract

- Related Files:
  - `src/features/world/CoworkerNpcEntity.ts` :: `update`, `reactToPlayer`; new
  - `src/features/world/CoworkerNpcField.ts` :: spawn/pool/reset; new
  - `src/features/world/coworkerNpcTypes.ts`; new
  - `public/assets/world/coworker-npc-spritesheet.png`; new
  - `src/content/assets/gameAssets.ts`; modify
  - `scripts/validate-assets.mjs`; modify

#### Details

```typescript
export type CoworkerReaction = 'walk' | 'startled' | 'duck' | 'recover';
export interface CoworkerNpcSnapshot { id: string; x: number; y: number; reaction: CoworkerReaction; collisionEnabled: false; }
public update(deltaMs: number, worldSpeed: number, playerX: number, playerY: number, boosterActive: boolean): void;
```

- NPC pool은 화면 하단 바닥 영역에서만 spawn하고 `x -= worldSpeed * scrollFactor`로 이동한다.
- player가 `reactionRadiusPx` 안에 들어오거나 booster/landing event가 발생하면 startled/duck tween을 실행한다.
- collision bounds를 만들지 않고, snapshot에도 `collisionEnabled:false`를 명시한다.

### I02. Integration and feedback

- Related Files:
  - `src/game/scenes/RunScene.ts` :: NPC field lifecycle; modify
  - `src/features/effects/RunEffects.ts` :: landing/dust reaction effects; modify if needed
  - `src/features/world/__tests__/CoworkerNpcField.test.ts`; new
  - `tests/e2e/playable-run.spec.ts` — NPC visual smoke; modify

#### Details

- NPC update는 background update 이후, collision field 이전에 수행해 화면 계층만 담당한다.
- NPC가 화면 밖으로 나가면 pool에 반환한다.
- NPC가 player hitbox와 겹쳐도 `ObstacleField` snapshot/count/collision outcome이 바뀌지 않는 테스트를 둔다.

## Acceptance Criteria

- [ ] 첫 구간에서 퇴근 NPC가 보이고 월드 속도에 맞춰 이동한다.
- [ ] 부스터/착지 근처에서 NPC 반응이 보인다.
- [ ] NPC는 충돌·점수·거리·방어막·랭킹에 영향을 주지 않는다.
- [ ] pool 크기가 제한되고 화면 밖 객체가 누적되지 않는다.

## Validation

- `git pull --ff-only origin main`
- `npm run validate:assets && npm run typecheck && npm run lint`
- `npm run test:run -- src/features/world`
- `npm run test:e2e -- tests/e2e/playable-run.spec.ts --workers=1`

## Commit Message

```text
feat(world): add non-colliding coworker reactions

Plan: 2026-11-03-5pm-rush-game-feel
Phase: P06-audio-and-world-life
Task: T12-coworker-npcs-and-feedback

- Add pooled after-work coworker NPCs to the office world
- Keep reactions visual-only and outside collision gameplay
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: pending (to be recorded after commit)
