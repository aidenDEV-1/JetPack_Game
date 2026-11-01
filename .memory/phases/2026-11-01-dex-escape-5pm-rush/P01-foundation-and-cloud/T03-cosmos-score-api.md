# Task: T03 Cosmos Score API

## Status: done

## Goal
인증된 사용자의 최고 기록과 누적 코인을 Azure Cosmos DB에 저장하고, 결과 화면에 필요한 TOP 10 랭킹을 반환하는 Azure Functions API 계약을 만든다.

## Decision Summary
- 초기 프로토타입은 클라이언트 결과를 그대로 저장하며 공식 부정행위 검증은 구현하지 않는다.
- 사용자 최고 기록만 저장하고, 누적 코인은 최고 기록과 별도로 유지한다.

## Implementation

### I01. Cosmos documents and API contracts
- Related Files:
  - `api/src/models/player-record.ts` — Cosmos document; new
  - `api/src/models/api-contracts.ts` — request/response types; new
  - `api/src/storage/cosmosClient.ts` — Cosmos client factory; new
  - `api/src/storage/playerRecordRepository.ts` — read/write operations; new

#### Details
- **Document**:
  ```typescript
  export interface PlayerRecordDocument {
    id: string;                 // Entra object/user id
    userId: string;
    displayName: string;
    tenantId: string;
    bestDistanceMeters: number;
    bestRunCoins: number;
    bestScore: number;
    bestAchievedAt: string;
    totalCoins: number;
    updatedAt: string;
  }
  ```
- Partition key: `/userId`. Use `userId` as `id` for one current-record document per user.
- **Contracts**:
  ```typescript
  export interface SaveRunRequest { distanceMeters: number; runCoins: number; score: number; }
  export interface SaveRunResponse { record: PlayerRecordDocument; isNewBest: boolean; }
  export interface LeaderboardEntry { rank: number; displayName: string; distanceMeters: number; coins: number; achievedAt: string; }
  export interface LeaderboardResponse { top10: LeaderboardEntry[]; currentUser: LeaderboardEntry | null; }
  ```

### I02. Functions and error handling
- Related Files:
  - `api/src/functions/saveRun.ts` — `POST /api/runs`; new
  - `api/src/functions/getLeaderboard.ts` — `GET /api/leaderboard`; new
  - `api/src/auth/requestUser.ts` — Static Web Apps identity extraction; new
  - `api/src/functions/__tests__/scoreApi.test.ts` — repository and handler tests; new

#### Details
1. Require authenticated Static Web Apps identity; return `401` if absent.
2. Read only `userId`, `displayName`, and `tenantId` from trusted identity headers.
3. Save `totalCoins + runCoins` for every accepted run.
4. Replace best fields only when `distanceMeters > bestDistanceMeters`; for equal distance keep the earlier `bestAchievedAt`.
5. Return `400` for missing/non-finite/negative numeric fields; no anti-cheat ceiling is applied in this prototype.
6. Query all current records, sort by distance descending then achieved time ascending, return top 10 plus current user rank.
7. Return `500` with a correlation id without leaking Cosmos credentials.

### I03. Azure identity and configuration
- Related Files:
  - `api/host.json` — Functions runtime settings; new
  - `api/local.settings.example.json` — local placeholders; new
  - `api/package.json` — Functions dependencies; new

#### Details
- Use Managed Identity for Cosmos access in Azure.
- Local development may use an explicit connection string only through uncommitted local settings.
- Required settings: `COSMOS_ENDPOINT`, `COSMOS_DATABASE`, `COSMOS_CONTAINER`, `COMPANY_TENANT_ID`.

## Acceptance Criteria
- [ ] 인증되지 않은 run/leaderboard 요청은 401이다.
- [ ] 플레이할 때마다 runCoins가 totalCoins에 더해진다.
- [ ] 더 먼 기록만 최고 기록을 갱신한다.
- [ ] 랭킹은 거리 내림차순, 동일 거리면 달성 시각 오름차순이다.
- [ ] 비밀값과 연결 문자열이 프론트엔드 번들에 포함되지 않는다.

## Validation
- `npm run test:run -- api/src/functions/__tests__/scoreApi.test.ts` — API 계약과 정렬 테스트 통과.
- Azure Functions staging에서 인증 요청·401·Cosmos 저장·랭킹 응답을 확인한다.

## Commit Message
```text
feat(api): add Cosmos score and leaderboard endpoints

Plan: 2026-11-01-dex-escape-5pm-rush
Phase: P01-foundation-and-cloud
Task: T03-cosmos-score-api

- add player record schema and leaderboard contracts
- persist best distance and cumulative coins through Functions
```

## Progress
- [x] 구현 완료
- [x] 검증 통과
- commit: pending
