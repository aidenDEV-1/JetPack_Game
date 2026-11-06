# 09. 장애물

## 목적과 관찰 결과

장애물은 보안 시스템이라는 세계관을 유지하면서 매번 다른 청크 조합을 제공하고, warning 이후 예측 가능한 회피 기회를 준다.

## 현재 확정 규칙

- 수직/수평 레이저, 보안 드론, 회전 장치, 미사일을 사용한다.
- 레이저 emitter 원형 충돌과 beam 직사각형 충돌을 분리한다.
- 레이저 span은 `fixed` 또는 `random`만 사용하며, 모든 runtime span은 `144~192px`로 제한한다.
- 화면 전체를 가로지르는 full-span 레이저와 `forced-crossfire` 강제 패턴은 사용하지 않는다.
- 방어막은 단일 장애물 충돌을 막는 아이템이며, 방어막을 미리 먹어야만 생존할 수 있는 장애물 청크는 사용하지 않는다.
- 일반 거리 청크 A~E에는 오른쪽 경고 후 왼쪽으로 진입하는 미사일을 포함할 수 있다.

## 튜닝 파일

- `src/game/config/tuning/obstacles.ts`

## 담당 코드

- `src/features/obstacles/*`, 향후 `src/features/chunks/*`

## 변경 시 검증

- `npm run test:run -- src/features/obstacles src/features/chunks`
- `npm run test:e2e -- tests/e2e/obstacle.spec.ts --workers=1`

## 참고 이미지

- `docs/reference/game-feel/02-obstacle-chunks.png`
