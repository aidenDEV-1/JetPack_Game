# 06. 최대 높이

## 목적과 관찰 결과

플레이어는 바닥에서 달리고 스페이스바를 누르면 상승하며, 천장 경계에서는 충돌이 아니라 반동·제동으로 최대 높이를 체감한다.

## 현재 확정 규칙

- `floorY` 아래로 내려가지 않으며 바닥에서는 RUN 포즈다.
- `ceilingY` 위로 누적되지 않고 튜닝된 bounce velocity로 되돌아온다.
- 장애물 통과 간격 기준은 플레이어 높이의 1.6배 이상이다.

## 튜닝 파일

- `src/game/config/tuning/movement.ts`

## 담당 코드

- `src/game/systems/RunMotionSystem.ts`, `src/game/scenes/RunScene.ts`

## 변경 시 검증

- `npm run test:run -- src/game/systems/RunMotionSystem.test.ts`
- 천장·바닥 입력 Playwright 확인

## 참고 이미지

- `docs/reference/game-feel/02-obstacle-chunks.png`: 플레이 가능한 수직 공간
