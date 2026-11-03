# 10. 게임 방식

## 목적과 관찰 결과

RunScene은 자동 전진·상승/하강·아이템·청크·충돌·사망·미션 이벤트를 순서대로 처리하고, 각 도메인 객체는 독립적으로 교체 가능해야 한다.

## 현재 확정 규칙

- 스페이스바 홀드로 상승하고 해제 시 중력으로 하강한다.
- 충돌 시 hit-stop→바운스 2회→미끄러짐 후 결과 화면을 표시한다.
- 기록 API·Entra ID·랭킹 모델은 유지한다.

## 튜닝 파일

- `src/game/config/tuning/movement.ts`, `speed.ts`, `items.ts`, `obstacles.ts`, `rewards.ts`

## 담당 코드

- `src/game/scenes/RunScene.ts`, `src/game/state/GameState.ts`
- `src/features/records`, `results`, `rewards`

## 변경 시 검증

- `npm run test:run`
- `npm run test:e2e -- tests/e2e/playable-run.spec.ts tests/e2e/results.spec.ts --workers=1`

## 참고 이미지

- `docs/reference/game-feel/02-obstacle-chunks.png`, `01-booster-reference.png`
