# 05. 배경

## 목적과 관찰 결과

배경은 L0 하늘/조명, L1 원경, L2 벽 모듈, L3 바닥 스트립으로 분리되어 서로 다른 속도로 반복 이동한다.

## 현재 확정 규칙

- 0~1000m 사무실, 1000~2000m 보안, 2000~3000m 도심, 3000~4000m 지하철 3구간, 4000m 이후 옥상이다.
- 바닥 레이어의 상단은 `floorY`와 맞아야 한다.
- 전환 라벨은 HUD와 겹치지 않는 별도 위치에 둔다.

## 튜닝 파일

- `src/game/config/tuning/background.ts`

## 담당 코드

- `src/features/background/BackgroundController.ts`
- `src/content/backgroundLayers.ts`, `backgroundSegments.ts`

## 변경 시 검증

- `npm run test:run -- src/features/background src/content/backgroundSegments.test.ts`
- 구간별 Playwright 스크린샷 비교

## 참고 이미지

- `docs/reference/game-feel/04-background-layers.png`: 레이어 구성과 패럴랙스 속도
