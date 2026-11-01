# 아키텍처

```text
React App
  ├─ AuthGate → Azure Static Web Apps /.auth
  ├─ HUD / Settings / Results / Leaderboard
  └─ Phaser Game
       ├─ RunScene
       ├─ Player / Items / Booster
       ├─ Obstacles / Collision
       ├─ Background / Progression
       └─ GameState

Azure Functions → Cosmos DB player-records (partition key: /userId)
```

## 경계

- React는 화면과 사용자 인터랙션을 담당한다.
- Phaser는 게임 루프·렌더링·입력을 담당한다.
- 순수 시스템(`RunMotionSystem`, `DistanceProgression`, `CollisionResolver`)은 테스트 가능한 계산만 담당한다.
- Azure Functions는 인증된 요청의 저장·랭킹 API를 담당한다.
- Cosmos DB에는 사용자별 현재 최고 기록 문서 한 건을 둔다.

## 이벤트·데이터 원칙

- 게임 결과는 충돌 애니메이션이 완료된 뒤 한 번 저장한다.
- 코인은 최고 기록 여부와 관계없이 누적한다.
- 랭킹은 거리 내림차순, 동점이면 `achievedAt` 오름차순이다.
- 원본 인증 토큰은 브라우저 저장소에 저장하지 않는다.
