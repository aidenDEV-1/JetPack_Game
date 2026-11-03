# 03. 제트팩

## 목적과 관찰 결과

갈색 가방을 개조한 제트팩으로 표현하며, 일반 불꽃·스파크·부스터 불꽃이 같은 노즐 앵커에서 나온다. 코인으로 향후 스타일을 교체할 수 있는 카탈로그 구조를 유지한다.

## 현재 확정 규칙

- 부스터는 별도 탈것이 아니라 `PlayerEntity`의 `isBoosting` 시각 상태다.
- `JetpackAttachment`는 플레이어 자식이며, flame→jetpack→body 순서를 지킨다.
- 수평으로 baked된 중복 불꽃은 사용하지 않는다.

## 튜닝 파일

- `src/game/config/tuning/booster.ts`

## 담당 코드

- `src/features/player/JetpackAttachment.ts`, `JetpackFlameVisual.ts`, `JetpackSparkEmitter.ts`
- `src/features/booster/boosterStyleCatalog.ts`

## 변경 시 검증

- `npm run test:run -- src/features/booster src/features/player`
- `npm run test:e2e -- tests/e2e/booster.spec.ts --workers=1`

## 참고 이미지

- `docs/reference/game-feel/01-booster-reference.png`: 목표 부스터 불꽃·가방 일체감
