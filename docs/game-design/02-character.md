# 02. 캐릭터

## 목적과 관찰 결과

현재 얼굴·안경·밀짚모자·정장·갈색 가방 디자인을 유지하면서 RUN, TAKEOFF, FLY, FALL, LANDING, HIT, DEAD 상태가 서로 다른 포즈로 보인다.

## 현재 확정 규칙

- 캐릭터는 플레이어 월드 root 하나만 렌더링한다.
- 플레이어 높이 기준은 `PLAYER_HEIGHT=96px`이다.
- 히트박스는 시각 실루엣보다 작고 디버그 모드에서만 보인다.

## 튜닝 파일

- `src/game/config/tuning/movement.ts`
- `src/features/player/playerAssetConfig.ts`

## 담당 코드

- `src/features/player/PlayerEntity.ts`, `playerAnimations.ts`, `playerAssetConfig.ts`
- `src/content/assets/playerSheetMeta.ts`

## 변경 시 검증

- `npm run test:run -- src/features/player`
- `npm run test:e2e -- tests/e2e/booster.spec.ts --workers=1`

## 참고 이미지

- `docs/reference/game-feel/01-booster-reference.png`: 비행 중 실루엣·기울기 비교
