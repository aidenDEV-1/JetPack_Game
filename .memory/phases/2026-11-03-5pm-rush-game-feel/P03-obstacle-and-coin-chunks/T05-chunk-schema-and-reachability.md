# Task: T05 장애물·코인 청크 데이터 모델과 통과 가능성 검증

## Status: done

## Goal

장애물과 코인을 하나의 거리 기반 청크로 정의하고, 0~1000m·1000~2000m·2000~3000m·3000m 이후의 난이도 풀을 데이터로 관리한다. 모든 청크가 캐릭터 높이 `H=96` 기준 최소 통과 간격 `1.6H`를 로딩/테스트 시 검증받도록 한다.

## Decision Summary

- 청크는 코드에서 타입이 보장되는 TypeScript 데이터로 시작하고, 랜덤성은 seeded random을 주입할 수 있게 한다.
- 청크 데이터에는 장애물과 코인 패턴을 함께 기록해 “랜덤 단발” 생성이 불가능하도록 한다.

## Implementation

### I01. Chunk schema

- Related Files:
  - `src/features/chunks/chunkTypes.ts` :: `GameChunk`, `ChunkObstacleSpec`, `ChunkCollectibleSpec`; new
  - `src/features/chunks/chunkCatalog.ts` :: `CHUNK_CATALOG`; new
  - `src/game/config/tuning/obstacles.ts` :: `minimumPlayableGap`, chunk weights; modify
  - `src/game/config/tuning/items.ts` :: coin density/pattern spacing; modify

#### Details

```typescript
export type ChunkId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface GameChunk {
  id: ChunkId;
  minDistanceMeters: number;
  maxDistanceMeters: number | null;
  weight: number;
  obstacles: readonly ChunkObstacleSpec[];
  collectibles: readonly ChunkCollectibleSpec[];
  requiresShield: boolean;
}

export interface ChunkObstacleSpec {
  patternId: string;
  xMeters: number;
  yRatio: number;
  warning: boolean;
  forced: boolean;
}

export interface ChunkCollectibleSpec {
  kind: 'coin' | 'token' | 'shield';
  xMeters: number;
  yRatio: number;
  pattern: 'line' | 'arc' | 'zigzag' | 'orbit';
}
```

- A~F는 참고 이미지 `02-obstacle-chunks.png`의 의미를 재현하되 회사 보안장치와 DEX 아이템 명칭으로 표현한다.
- `xMeters`는 속도와 독립된 거리 좌표이며, 실제 픽셀 위치는 `pixelsPerMeter`로 변환한다.
- 모든 `yRatio`는 `ceilingY`~`floorY` 범위 안에 있고, forced 패턴은 방어막 선행 조건을 표시한다.

### I02. Static validator

- Related Files:
  - `src/features/chunks/chunkReachability.ts` :: `validateChunkReachability`; new
  - `src/features/chunks/__tests__/chunkReachability.test.ts`; new
  - `src/features/obstacles/obstacleCollisionGeometry.ts` :: existing geometric helper; read-only

#### Details

```typescript
export interface ChunkValidationError { chunkId: string; reason: string; }
export function validateChunkReachability(chunk: GameChunk, minimumGapPx: number): ChunkValidationError[];
```

- obstacle collision bounds와 player collision bounds를 이용해 각 구간의 빈 공간을 계산한다.
- 빈 공간이 `Math.round(PLAYER_HEIGHT * 1.6)`보다 작으면 에러를 반환한다.
- 청크 내부에서 코인 경로가 모든 장애물 충돌 영역과 겹치면 경고 또는 실패로 처리한다.
- 시작 1100m 이전 강제 즉사 패턴, 방어막 미등장 상태의 forced 청크는 실패시킨다.

## Acceptance Criteria

- [ ] A~F 청크가 타입과 거리 구간을 가진다.
- [ ] 모든 청크가 최소 1.6H 통과 간격과 shield 선행 규칙을 만족한다.
- [ ] 청크 데이터만 수정해 코인·장애물 모양을 바꿀 수 있다.
- [ ] 검증 실패 시 청크 ID와 원인이 명확히 출력된다.

## Validation

- `git pull --ff-only origin main`
- `npm run typecheck && npm run lint`
- `npm run test:run -- src/features/chunks src/features/obstacles`
- `npm run validate:assets`

## Commit Message

```text
feat(chunks): define distance-based obstacle and coin patterns

Plan: 2026-11-03-5pm-rush-game-feel
Phase: P03-obstacle-and-coin-chunks
Task: T05-chunk-schema-and-reachability

- Add typed A-F gameplay chunks with shared collectible layouts
- Validate playable gaps and shield prerequisites before runtime
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: pending (현재 task 커밋에서 기록)
