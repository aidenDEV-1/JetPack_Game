# 04. 아이템

## 목적과 관찰 결과

코인은 자주 보이는 패턴으로 거리·점수를 만들고, DEX 토큰 3개는 부스터를 발동하며, 방어막은 드문 구제 수단으로 사용한다.

## 현재 확정 규칙

- 코인은 line/arc/zigzag/orbit 패턴으로 청크에 포함된다.
- 토큰 3개 수집 시 부스터를 발동하고 카운터를 초기화한다.
- 방어막은 1100m 이후 등장 가능하며 중첩되지 않는다.

## 튜닝 파일

- `src/game/config/tuning/items.ts`

## 담당 코드

- `src/features/items/CollectibleField.ts`, `ItemEntity.ts`, `movementPatterns.ts`

## 변경 시 검증

- `npm run test:run -- src/features/items`
- `npm run test:e2e -- tests/e2e/collectible.spec.ts --workers=1`

## 참고 이미지

- `docs/reference/game-feel/02-obstacle-chunks.png`: 장애물 사이 코인 경로 밀도
