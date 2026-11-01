# Task: T07 Obstacles and Collision

## Status: pending

## Goal
수직·가로 레이저, 미사일, 몬스터와 방어막 소비·게임 종료 충돌 규칙을 구현한다.

## Decision Summary
- 미사일과 일부 특수 장애물만 우측 화살표로 예고한다.
- 일반 패턴은 회피 가능하지만, 구간당 최대 1회의 강제 충돌 패턴은 방어막이 먼저 등장한 뒤 예고 없이 생성한다.

## Implementation

### I01. Obstacle definitions and spawner
- Related Files:
  - `src/features/obstacles/obstacleTypes.ts` — obstacle contracts; new
  - `src/features/obstacles/ObstacleEntity.ts` — visual/collision body; new
  - `src/features/obstacles/ObstacleSpawner.ts` — pattern selection; new
  - `src/features/obstacles/obstaclePatterns.ts` — reachable and shield-gated patterns; new

#### Details
- **Types**:
  ```typescript
  export type ObstacleKind = 'vertical-laser' | 'horizontal-laser' | 'missile' | 'monster';
  export interface ObstaclePattern { id: string; kind: ObstacleKind; requiresShield: boolean; warningArrow: boolean; }
  export interface SpawnContext { distanceMeters: number; speed: number; hasShieldPickupAhead: boolean; forcedPatternUsedInSegment: boolean; }
  ```
- `warningArrow=true` only for missiles and explicitly marked special obstacles.
- `requiresShield=true` patterns are allowed only after a shield pickup has been spawned and only once per 1,000m segment.
- Use a reachability validator for ordinary patterns; reject layouts with no route through the playable vertical corridor.

### I02. Collision resolver
- Related Files:
  - `src/features/obstacles/CollisionResolver.ts` — collision outcomes; new
  - `src/features/obstacles/__tests__/CollisionResolver.test.ts` — tests; new

#### Details
- **API**:
  ```typescript
  export type CollisionOutcome = 'ignored-by-booster' | 'blocked-by-shield' | 'crash';
  export function resolveObstacleCollision(input: { invincible: boolean; hasShield: boolean }): CollisionOutcome;
  ```
- Priority: invincible → ignored; else shield → consume shield and continue; else crash.
- Ceiling contact never calls the resolver. Floor contact changes animation only.
- On crash, freeze spawns and distance, play PlayerEntity crash sequence, then transition to results.

## Acceptance Criteria
- [ ] Four obstacle kinds render and collide independently.
- [ ] Missile warning arrows appear only for configured warning patterns.
- [ ] No forced pattern appears before its shield pickup or more than once per segment.
- [ ] Booster ignores all obstacle collisions; shield absorbs one; unprotected collision ends run.

## Validation
- `npm run test:run -- src/features/obstacles` — outcome, gating, and reachability tests pass.
- Seeded simulation of 10,000m confirms no unprotected forced pattern is generated before a shield pickup.

## Commit Message
```text
feat(obstacles): add hazards collision rules and shield-gated patterns

Plan: 2026-11-01-dex-escape-5pm-rush
Phase: P02-gameplay-core
Task: T07-obstacles-and-collision

- add lasers missiles monsters and warning arrows
- implement booster, shield, and forced-pattern collision outcomes
```

## Progress
- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
