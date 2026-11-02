# Task: T01 Transparent Player and Booster Style Assets

## Status: done ✅

## Goal

플레이어 24개 애니메이션 프레임에서 캐릭터·모자·가방·불꽃 외의 반투명 사각형 후광을 제거하고, 기존 얼굴·밀짚모자·가죽가방 디자인을 유지한 투명 에셋을 준비한다. 동시에 부스터가 사용할 기본 `leather-rocket` 스타일과 향후 코인으로 교체할 스타일의 공통 데이터 계약을 만든다.

## Decision Summary

- 현재 `player-spritesheet.png`의 `4×6`, 프레임 `384×170` 규격과 기존 애니메이션 frame 번호를 유지해 T02에서 `BootScene` 재작성 범위를 최소화한다.
- 부스터 에셋은 캐릭터와 별도로 떠 있는 완성 로켓 이미지가 아니라, 가방 위치를 덮어쓰고 가방 하단에서 불꽃이 이어지는 투명 `bag-to-rocket` overlay 프레임으로 만든다. 스타일은 카탈로그로 관리하고 이번에는 기본 스타일 하나만 등록한다.

## Implementation

### I01. 캐릭터 프레임 알파 정리

- Related Files:
  - `public/assets/player/player-spritesheet.png` :: 24개 플레이어 프레임 — 캐릭터 외부의 반투명 그라데이션·사각형 후광 제거; replace asset only
  - `src/content/assets/gameAssets.ts` :: `gameAssetDefinitions`, `gameAssetKeys.playerSheet` — 기존 `384×170`, `frameCount: 24` 계약 유지; read-only unless metadata must be corrected
  - `src/services/assetRegistry.test.ts` :: spritesheet metadata and asset existence tests — 투명 플레이어 에셋이 기존 frame grid와 일치하는지 검증; modify
  - `scripts/validate-assets.mjs` :: required asset validation — 최종 PNG만 검사하고 원본 사진을 추가하지 않는 기존 규칙 확인; read-only unless a transparent asset rule is needed

#### Details

- **Asset Contract**:
  - 전체 파일 크기: `1536×1024`.
  - 프레임 grid: 가로 4칸, 세로 6칸, 각 프레임 `384×170`, 총 24프레임.
  - 각 프레임은 RGBA PNG이며 캐릭터 실루엣 바깥의 픽셀은 `alpha === 0`이어야 한다. 부드러운 가장자리 안티앨리어싱만 허용하고, 프레임 전체에 남는 색상·그림자·그라데이션 사각형은 허용하지 않는다.
  - 얼굴·안경·밀짚모자·갈색 가죽가방의 승인된 디자인은 변경하지 않는다. 가방은 평상시 플레이어 이미지에 계속 포함된다.
  - 기존 boosting row에 포함된 파란색 speed trail/큰 원형 aura는 유지하지 않는다. 부스터 속도감은 T02의 가방 로켓 overlay와 배경 이동으로 표현하고, 캐릭터 프레임에는 캐릭터 실루엣만 남긴다.
  - 캐릭터의 프레임별 pivot은 기존 `Sprite` 중심 기준을 유지한다. 투명화 과정에서 캐릭터 픽셀을 프레임 안에서 이동시키지 않아 기존 `PLAYER_JETPACK_ANCHOR`와 `PLAYER_COLLISION_BOUNDS`가 어긋나지 않게 한다.

- **Execution Flow / Logic**:
  1. Precondition & Validation: 원본 사진 파일이나 `IMG_`, `photo`, `face` 이름의 파일을 `public/assets`에 복사하지 않고, 현재 24프레임 번호와 각 애니메이션 row(`0`, `4`, `8`, `12`, `16`, `20`)를 보존한다.
  2. Core Processing: 각 프레임의 배경·후광을 알파 0으로 제거하고, 캐릭터 실루엣·가방·모자·잔여 불꽃만 유지한다. 프레임 cell 크기를 자르거나 재배치하지 않는다.
  3. Error & Exception Handling: frame 수가 24보다 줄거나 PNG가 RGB로 저장되면 asset validation이 실패해야 한다. 누락 시 투명 사각형 placeholder를 만들지 않고 기존 BootScene load error 흐름을 사용한다.
  4. State Transition & Return: asset registry가 기존 `player-spritesheet` key를 계속 반환하고, BootScene의 running/flying/falling/boosting/crashing/fallen animation이 같은 frame 번호를 읽는다.

### I02. 교체 가능한 로켓 스타일 에셋 계약

- Related Files:
  - `public/assets/player/booster-forms-spritesheet.png` :: 기본 가방 변환 로켓 overlay — 신규 투명 PNG, 4개 booster frame; new
  - `src/content/assets/gameAssets.ts` :: `gameAssetKeys.boosterFormsSheet`, asset definition — booster form spritesheet runtime key와 `384×170`, `frameCount: 4` 등록; modify
  - `src/content/assets/playerAssets.ts` :: `playerAssetDescriptions`, player/booster asset descriptions — 가방 변환 로켓과 향후 스타일의 콘텐츠 설명; modify
  - `src/features/booster/boosterStyleTypes.ts` :: `BoosterStyleId`, `BoosterStyleDefinition` — 스타일 데이터 계약; new
  - `src/features/booster/boosterStyleCatalog.ts` :: `boosterStyleCatalog`, `DEFAULT_BOOSTER_STYLE_ID` — 현재 기본 스타일과 미래 코인 가격 메타데이터; new
  - `src/services/assetRegistry.test.ts` :: booster form asset metadata assertion — 신규 spritesheet가 registry에 포함되는지 검증; modify

#### Details

- **Signatures & Types**:

  ```typescript
  export type BoosterStyleId = 'leather-rocket';

  export interface BoosterStyleDefinition {
    id: BoosterStyleId;
    displayName: string;
    textureKey: string;
    frameWidth: number;
    frameHeight: number;
    frameCount: number;
    frameStart: number;
    anchor: { x: number; y: number };
    scaleX: number;
    scaleY: number;
    coinPrice: number;
    defaultUnlocked: boolean;
  }

  export const DEFAULT_BOOSTER_STYLE_ID: BoosterStyleId = 'leather-rocket';
  export const boosterStyleCatalog: readonly BoosterStyleDefinition[];
  export function getBoosterStyle(id: BoosterStyleId): BoosterStyleDefinition;
  ```

- **Data & Asset Fields**:
  - `leather-rocket`: `displayName: '가죽 로켓'`, `textureKey: gameAssetKeys.boosterFormsSheet`, `frameWidth: 384`, `frameHeight: 170`, `frameCount: 4`, `frameStart: 0`, `coinPrice: 0`, `defaultUnlocked: true`.
  - `anchor`: 현재 `PLAYER_JETPACK_ANCHOR`와 같은 가방 배출구 기준점에서 시작하도록 정의한다. T02가 player config와 중복 값을 만들지 않도록 최종 anchor source를 한 곳으로 정한다.
  - `scaleX`, `scaleY`는 기존 캐릭터 `PLAYER_SPRITE_SCALE`과 화면에서 가방을 덮는 크기를 기준으로 정한다. 로켓이 몸체와 분리되어 보일 정도로 오른쪽 또는 위로 이동하는 값은 허용하지 않는다.
  - `coinPrice`와 `defaultUnlocked`는 미래 상점·저장 API가 사용할 metadata다. 이번 Task에서는 구매 상태 변경이나 코인 차감 함수를 만들지 않는다.

- **Booster Form Asset Requirements**:
  - 파일은 `1536×170`(가로 4프레임) 또는 동일한 `384×170` frame grid를 사용하며, registry metadata와 실제 PNG 크기가 일치해야 한다.
  - 각 frame에는 가방을 덮는 갈색/금속 로켓 shell, 가방과 캐릭터를 연결하는 mount, shell 하단에서 이어지는 주황색 불꽃만 포함한다. 얼굴·모자·몸통을 중복 그리지 않는다.
  - frame 0은 변환 시작, frame 1은 점화, frame 2~3은 비행 상태로 설계한다. 모든 프레임의 mount 기준점은 동일해야 한다.
  - 로켓 shell은 기존 가방이 비치는 틈이 없도록 가방 영역을 충분히 덮되, 캐릭터 몸통을 가리지 않는다. 로켓 외곽의 배경·사각형 후광·검정색 매트는 완전 투명이어야 한다.

- **Execution Flow / Logic**:
  1. Precondition & Validation: catalog의 모든 `textureKey`가 asset registry에 존재하고, `frameStart + frameCount`가 spritesheet frame 수를 넘지 않는지 검사한다.
  2. Core Processing: `getBoosterStyle(DEFAULT_BOOSTER_STYLE_ID)`가 현재 기본 스타일을 반환하며, 미래 style id를 추가할 때 `PlayerEntity`나 `RunScene`을 수정하지 않아도 되는 형태로 만든다.
  3. Error & Exception Handling: 알 수 없는 style id는 무작위 fallback이 아니라 명시적인 `Error`를 발생시키거나 기본 style을 반환하는 정책을 함수에 고정하고 테스트한다. 이번 기본 구현에서는 기본 style 반환을 사용한다.
  4. State Transition & Return: 카탈로그는 읽기 전용 배열을 반환하며 게임 중 코인 수나 구매 상태를 변경하지 않는다.

### I03. 에셋 계약 단위 테스트

- Related Files:
  - `src/features/booster/__tests__/boosterStyleCatalog.test.ts` :: catalog completeness and default style tests — 신규; new
  - `src/features/player/__tests__/PlayerEntity.test.ts` :: existing animation/bounds contract — T02에서 사용할 anchor·collision invariant를 위한 현재 계약 확인; read-only unless assertion is needed

#### Details

- catalog가 비어 있지 않고 `DEFAULT_BOOSTER_STYLE_ID`를 포함하는지 확인한다.
- 기본 스타일의 `frameWidth`, `frameHeight`, `frameCount`, `coinPrice`, `defaultUnlocked`가 명시된 값과 일치하는지 확인한다.
- `textureKey`가 실제 `gameAssetDefinitions`에 등록되어 있고, 모든 `BoosterStyleId`가 중복되지 않는지 확인한다.
- 스타일 메타데이터 테스트가 구매 API나 React UI를 호출하지 않도록 순수 데이터 테스트로 유지한다.

## Acceptance Criteria

- [ ] 플레이어 24프레임의 캐릭터 외부에 보이던 네모난 반투명 후광과 기존 boosting row의 큰 blue trail/aura가 제거되고 얼굴·모자·가방 디자인은 유지된다.
- [ ] 기본 `leather-rocket` overlay가 투명 배경, 4개 변환 frame, 동일한 mount 기준점을 갖는다.
- [ ] `BoosterStyleDefinition`에 향후 코인 가격·잠금 상태·에셋 key를 저장할 수 있고, 현재 기본 스타일만 활성화된다.
- [ ] 기존 player animation frame 번호와 `PLAYER_COLLISION_BOUNDS` 계약이 변경되지 않는다.

## Validation

- `npm run validate:assets` — 기존 필수 에셋과 신규 booster form metadata가 모두 존재하고 frame 크기가 일치한다.
- `npm run test:run -- src/services/assetRegistry.test.ts src/features/booster/__tests__/boosterStyleCatalog.test.ts` — asset registry와 style catalog 테스트 통과.
- `npm run typecheck` — 신규 catalog/type 계약 오류 없음.

## Commit Message

```text
feat(assets): add transparent player and rocket booster style contract

Plan: 2026-11-02-5pm-rush-rocket-booster-hazard-design
Phase: P01-rocket-booster-and-laser-redesign
Task: T01-transparent-player-and-booster-style-assets

- remove rectangular player sprite halos while preserving frame layout
- add a coin-ready rocket booster style catalog
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: pending
