# 09. 장애물

## 목적과 관찰 결과

장애물은 보안 시스템이라는 세계관을 유지하면서 매번 다른 청크 조합을 제공하고, warning 이후 예측 가능한 회피 기회를 준다.

## 현재 확정 규칙

- 수직/수평 레이저, 보안 드론, 회전 장치, 미사일을 사용한다.
- 레이저 emitter 원형 충돌과 beam 직사각형 충돌을 분리한다.
- 강제 패턴은 1100m 이후 방어막이 먼저 등장한 경우에만 사용한다.

## 튜닝 파일

- `src/game/config/tuning/obstacles.ts`

## 담당 코드

- `src/features/obstacles/*`, 향후 `src/features/chunks/*`

## 변경 시 검증

- `npm run test:run -- src/features/obstacles src/features/chunks`
- `npm run test:e2e -- tests/e2e/obstacle.spec.ts --workers=1`

## 참고 이미지

- `docs/reference/game-feel/02-obstacle-chunks.png`
