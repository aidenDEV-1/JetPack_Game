# 01. 게임 컨셉

## 목적과 관찰 결과

오후 5시 정각 회사에서 탈출해 가장 먼 거리를 기록한다. 플레이어는 거리를 늘리고 코인·DEX 토큰을 모으며 랭킹 기록을 갱신한다.

## 현재 확정 규칙

- 시작 버튼 후 5시 벽시계와 알람 인트로가 재생된다.
- 가방 제트팩 부스터로 잠시 빠르게 이동하고, 이후 자동 전진 비행을 한다.
- 원작의 명칭·캐릭터·에셋은 사용하지 않는다.

## 튜닝 파일

- 향후 `src/game/config/tuning/speed.ts`, `movement.ts`, `rewards.ts`

## 담당 코드

- `src/game/scenes/RunScene.ts`, `src/game/state/GameState.ts`, `src/content/copy.ko.ts`

## 변경 시 검증

- `npm run test:run -- src/game/state`
- `npm run test:e2e -- tests/e2e/playable-run.spec.ts --workers=1`

## 참고 이미지

- `docs/reference/game-feel/01-booster-reference.png`: 퇴근 탈출·부스터 연출의 감정선
