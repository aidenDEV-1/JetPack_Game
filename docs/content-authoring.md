# 콘텐츠 수정 가이드

게임의 11개 요소는 아래 위치를 독립적으로 수정한다.

| 요소 | 수정 위치 | 원칙 |
| --- | --- | --- |
| 게임 컨셉·문구 | `src/content/copy.ko.ts` | 게임 로직에 문자열을 직접 넣지 않는다. |
| 캐릭터 | `src/content/assets/playerAssets.ts`, `src/features/player/` | 얼굴·모자·애니메이션을 분리한다. |
| 제트팩 | `src/content/assets/playerAssets.ts`, `PlayerEntity.ts` | 가죽가방과 불꽃 레이어를 독립 교체한다. |
| 코인·방어막·토큰 | `src/features/items/`, `src/content/assets/itemAssets.ts` | `ItemKind`와 인벤토리 규칙을 사용한다. |
| 배경 | `src/content/backgroundSegments.ts`, `src/content/backgroundLayers.ts`, `src/features/background/` | 1,000m 구간과 반복 레이어를 분리한다. |
| 최대 높이·바닥 | `src/game/config/gameConfig.ts`, `RunMotionSystem.ts` | 천장 반발은 충돌 resolver를 호출하지 않는다. |
| 이동속도 | `src/features/progression/progressionConfig.ts`, `DistanceProgression.ts` | 구간별 15% 증가·5,000m 상한을 유지한다. |
| 부스터 | `src/features/booster/` | 토큰 3개·5초·무적 규칙을 controller에 둔다. |
| 장애물 | `src/features/obstacles/` | warning과 shield-gated pattern을 타입으로 구분한다. |
| 게임 방식 | `src/game/`, `src/features/*` | Phaser 장면과 순수 시스템을 직접 결합하지 않는다. |
| 기술 스택·배포 | `package.json`, `infra/`, `.github/workflows/` | 인증·비밀값을 프론트 번들에 넣지 않는다. |

새 콘텐츠는 기존 타입과 이벤트 계약을 사용하고, 다른 feature 폴더의 내부 상태를 직접 수정하지 않는다. 원본 얼굴 사진은 커밋·배포하지 않고 최종 일러스트 에셋만 사용한다.

## 새 에셋과 구간을 추가하는 순서

1. `public/assets/<content>/`에 최종 게임용 PNG를 추가하고 원본 사진이나 `IMG_`, `photo`, `face` 파일은 넣지 않는다.
2. `src/services/assetRegistry.ts`에 경로·파일 종류·spritesheet frame 크기를 등록하고 `src/content/assets/gameAssets.ts`에 런타임 key를 추가한다.
3. 캐릭터는 `BootScene.ts`의 animation frame 범위와 `playerAssetConfig.ts`를 함께 수정한다. 제트팩·부스터 VFX는 `PlayerEntity.ts`의 독립 레이어로 교체한다.
4. 배경 구간은 `backgroundSegments.ts`의 거리 범위와 `backgroundLayers.ts`의 레이어별 key를 함께 수정한다. 1,000m마다 장면을 바꾸되 타일 폭과 `scrollFactor`는 `BackgroundController.ts`에서 관리한다.
5. 아이템 spawn 간격·방어막 cooldown은 `collectibleSpawn.ts`, 토큰 이동 패턴은 `movementPatterns.ts`에서 수정한다. 장애물 패턴은 `obstaclePatterns.ts`와 `ObstacleSpawner.ts`에서 별도로 관리한다.
6. 변경 후 `npm run validate:assets`, `npm run typecheck`, 관련 unit/E2E를 실행한다. 콘텐츠 수정은 `RunScene.ts`에 에셋 로직을 직접 합치지 않고 feature 폴더의 타입·이벤트 계약을 유지한다.
