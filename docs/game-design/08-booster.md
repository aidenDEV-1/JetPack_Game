# 08. 부스터

## 목적과 관찰 결과

5시 정각 시작과 DEX 토큰 3개 수집을 보상하는 강한 순간을 만들고, 종료 후에도 짧은 유예 무적으로 억울한 즉사를 막는다.

## 현재 확정 규칙

- 시작: 벽시계·알람·인트로 후 1.5초 짧은 부스트.
- 일반: 토큰 3개 수집 시 가방 제트팩 강화.
- 부스터 중 불꽃 길이 2~2.5배, 몸 기울기 -12도, 속도선 표시.
- 종료 후 1초 grace invincibility.

## 튜닝 파일

- `src/game/config/tuning/booster.ts`

## 담당 코드

- `src/features/booster/*`, `src/features/player/JetpackAttachment.ts`, `src/features/start/*`

## 변경 시 검증

- `npm run test:run -- src/features/booster src/features/start`
- `npm run test:e2e -- tests/e2e/booster.spec.ts --workers=1`

## 참고 이미지

- `docs/reference/game-feel/01-booster-reference.png`
