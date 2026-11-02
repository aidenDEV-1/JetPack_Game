# 콘텐츠 수정 가이드

게임의 11개 요소는 아래 위치를 독립적으로 수정한다.

| 요소 | 수정 위치 | 원칙 |
| --- | --- | --- |
| 게임 컨셉·문구 | `src/content/copy.ko.ts` | 게임 로직에 문자열을 직접 넣지 않는다. |
| 캐릭터 | `public/assets/player/player-spritesheet.png`, `src/content/assets/playerAssets.ts`, `src/features/player/` | 7 row × 4 frame, 총 28개 `384×170` RGBA frame을 유지하고 캐릭터 외부는 투명하게 관리한다. RUN/TAKEOFF/FLY/FALL/LAND/HIT/DEAD row를 재사용하지 않는다. |
| 제트팩 | `src/features/booster/boosterStyleTypes.ts`, `boosterStyleCatalog.ts`, `PlayerEntity.ts`, `JetpackAttachment.ts` | 가방 로켓 form과 불꽃·bounded spark를 `PlayerEntity` local child로 관리하고 `BoosterStyleDefinition.vfx` anchor를 사용한다. |
| 코인·방어막·토큰 | `src/features/items/`, `src/content/assets/itemAssets.ts` | `ItemKind`와 인벤토리 규칙을 사용한다. |
| 배경 | `src/content/backgroundSegments.ts`, `src/content/backgroundLayers.ts`, `src/features/background/` | 1,000m 구간과 반복 레이어를 분리한다. |
| 최대 높이·바닥 | `src/game/config/gameConfig.ts`, `RunMotionSystem.ts` | 천장 반발은 충돌 resolver를 호출하지 않는다. |
| 이동속도 | `src/features/progression/progressionConfig.ts`, `DistanceProgression.ts` | 구간별 15% 증가·5,000m 상한을 유지한다. |
| 부스터 | `src/features/booster/` | 토큰 3개·5초·무적 규칙을 controller에 둔다. |
| 장애물 | `src/features/obstacles/` | `obstacleVisualCatalog`의 security-drone/electro-drone/missile/rotor와 motion을 사용하고, warning·shield-gated pattern·laser span을 타입으로 구분하며 표시 장식과 collision을 분리한다. |
| 게임 방식 | `src/game/`, `src/features/*` | Phaser 장면과 순수 시스템을 직접 결합하지 않는다. |
| 기술 스택·배포 | `package.json`, `infra/`, `.github/workflows/` | 인증·비밀값을 프론트 번들에 넣지 않는다. |

새 콘텐츠는 기존 타입과 이벤트 계약을 사용하고, 다른 feature 폴더의 내부 상태를 직접 수정하지 않는다. 원본 얼굴 사진은 커밋·배포하지 않고 최종 일러스트 에셋만 사용한다. 장애물의 `displayWidth/displayHeight`와 collision `width/height`는 `obstaclePatterns.ts`에서 함께 검토하고, 우측 warning 표시 lifecycle은 `ObstacleWarningIndicator.ts`에서 관리한다.

## 새 에셋과 구간을 추가하는 순서

1. `public/assets/<content>/`에 최종 게임용 PNG/SVG를 추가하고 원본 사진이나 `IMG_`, `photo`, `face` 파일은 넣지 않는다.
2. `src/services/assetRegistry.ts`에 경로·파일 종류·spritesheet frame 크기를 등록하고 `src/content/assets/gameAssets.ts`에 런타임 key를 추가한다.
3. 캐릭터는 `BootScene.ts`의 animation frame 범위와 `playerAssetConfig.ts`를 함께 수정한다. 현재 row map은 `0–3 RUN`, `4–7 TAKEOFF`, `8–11 FLY`, `12–15 FALL`, `16–19 LAND`, `20–23 HIT`, `24–27 DEAD`이며 고정 `384×170` cell과 알파 0 외곽을 지킨다. 제트팩·부스터 form은 `boosterStyleCatalog.ts`의 style metadata와 `vfx.flame/sparks` anchor를 읽는 `JetpackAttachment.ts` child로 교체하며 `RunScene.ts`에 별도 rocket sprite를 만들지 않는다.
4. 배경 구간은 `backgroundSegments.ts`의 거리 범위와 `backgroundLayers.ts`의 레이어별 key를 함께 수정한다. 1,000m마다 장면을 바꾸되 타일 폭과 `scrollFactor`는 `BackgroundController.ts`에서 관리한다.
5. 아이템 spawn 간격·방어막 cooldown은 `collectibleSpawn.ts`, 토큰 이동 패턴은 `movementPatterns.ts`에서 수정한다. 장애물 패턴은 `obstaclePatterns.ts`와 `ObstacleSpawner.ts`에서 별도로 관리하고, 레이저 길이는 `laserSpanResolver.ts`, glow/core/emitter 렌더링은 `LaserHazardVisual.ts`에서 관리한다.
6. HUD 아이콘은 `public/assets/ui/{coin-icon,dex-token-icon,shield-icon,booster-icon}.svg`의 투명 벡터 규격을 사용한다. 변경 후 `npm run validate:assets`, `npm run typecheck`, 관련 unit/E2E를 실행한다. 콘텐츠 수정은 `RunScene.ts`에 에셋 로직을 직접 합치지 않고 feature 폴더의 타입·이벤트 계약을 유지한다.

## 로켓 스타일 추가

새 로켓 외형은 `public/assets/player/booster-forms-spritesheet.png`와 같은 투명 overlay 규격을 사용한다. 스타일마다 `id`, `textureKey`, `frameWidth`, `frameHeight`, `frameCount`, `frameStart`, `anchor`, `scaleX`, `scaleY`, `coinPrice`, `defaultUnlocked`를 `boosterStyleCatalog.ts`에 추가한다. 이번 구조에서는 카탈로그가 외형을 설명할 뿐이며, 코인 차감·구매 상태·Cosmos 저장은 별도 상점/백엔드 Task에서 구현한다.

로켓 overlay는 캐릭터 얼굴·모자·몸통을 중복으로 그리지 않고 기존 가방 영역을 덮는 mount와 불꽃만 포함해야 한다. `PlayerEntity` 외부에 `scene.add.sprite()`로 로켓을 만들면 이동·충돌·충돌 회전 때 분리될 수 있으므로 금지한다.

## 레이저 패턴 추가

레이저 pattern에는 `laserSpan`의 `orientation`, `mode`, `length` 또는 `minLength/maxLength`, `fullSpanChance`, `margin`과 `laserVisual`의 glow/core/beam 폭·색을 함께 등록한다. `full`은 viewport span, `fixed`는 고정 길이, `random`은 spawn 시 한 번만 해상도된다. glow·emitter·warning의 표시 크기를 collision footprint에 복사하지 않는다.

## 장애물·feedback 규칙

`obstacles-spritesheet.png`는 3×2, 6 frame(512×512)이며 frame 0–3은 security-drone, electro-drone, missile, rotor다. `ObstacleMotionSpec`의 hover/sway/spin은 local visual child만 움직이고 world x 이동과 collision rectangle은 `ObstacleField`가 소유한다. `RunEffects`는 dust 12, pickup 8, crash 16, booster 2개의 고정 pool을 사용한다. frame마다 Graphics/Sprite를 추가하거나 player trail/ghost를 만들지 않는다.
