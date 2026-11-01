# Task: T01 Asset Manifest and Generation

## Status: done

## Goal

현재 비어 있는 `assetRegistry`와 도형 placeholder를 대체할 게임용 raster/spritesheet 에셋을 콘텐츠별 디렉터리에 만들고, BootScene에서 모든 필수 키를 Phaser에 로드할 수 있는 단일 manifest 계약을 확립한다. 이 Task가 끝나면 실제 파일이 없는 키, 잘못된 경로, 원본 얼굴 사진의 저장소 유입이 빌드 전에 발견되어야 한다.

## Decision Summary

- 캐릭터·제트팩·아이템·장애물·배경은 서로 다른 asset key와 디렉터리를 사용한다. 향후 한 콘텐츠를 교체해도 다른 콘텐츠 코드와 manifest를 수정하지 않는다.
- 실행 시 `imagegen` skill을 읽고 첨부 얼굴 사진을 참조해 캐릭터 일러스트를 생성한다. 원본 사진은 `public/`이나 git에 복사하지 않는다.

## Implementation

### I01. 콘텐츠 에셋 패키지 생성

- Related Files:
  - `public/assets/player/` — 캐릭터 sprite sheet와 상태별 보조 이펙트; new assets
  - `public/assets/items/` — coin/shield/DEX token 이미지; new assets
  - `public/assets/obstacles/` — laser/missile/monster 이미지; new assets
  - `public/assets/backgrounds/` — 5개 구간의 far/mid/near 반복 배경; new assets
  - `public/assets/ui/` — 부스터 aura/trail와 충돌 burst; new assets

#### Details

- 캐릭터 sprite sheet는 `running`, `flying`, `falling`, `boosting`, `crashing`, `fallen` 상태를 최소 4프레임씩 제공한다. 얼굴은 첨부 사진의 얼굴형·안경·눈썹·눈·코·입 비율을 일러스트로 반영하고, 밀짚모자 챙을 깊게 내려 머리카락이 보이지 않게 한다. 갈색 가죽가방은 몸 뒤에 고정된 제트팩으로 읽히며, 불꽃은 별도 투명 asset으로 분리한다.
- 아이템은 코인, 청록 방어막, `DEX.` 토큰의 투명 배경 icon/sprite sheet를 제공한다. 아이콘 내부 문자는 기존 DEX 로고의 색상 대비를 유지하되 작은 화면에서도 판독 가능해야 한다.
- 배경은 각 구간에 대해 `far`, `mid`, `near` 레이어 key를 등록한다. T01에서는 장면당 고품질 원본 1개를 세 레이어 key가 공통 참조해 초기 번들 중복을 막고, 0~1000m 사무실·복도, 1000~2000m 보안 게이트·주차장, 2000~3000m 도심 고층빌딩, 3000~4000m 지하철 진입·내부·지상 탈출, 4000m 이후 야간 하늘·옥상 장면을 제공한다. 지하철 구간은 최소 `entrance`, `inside`, `exit` 하위 장면 key를 준비하며, 실제 depth별 변형은 T03에서 추가한다.
- 장애물은 현재 도형의 실루엣을 보완하는 laser emitter, missile, monster asset을 만들고, 실제 충돌 영역은 투명 여백을 제외한 metadata 기준으로 둘 수 있도록 한다.
- 이미지 생성 완료 후 수동으로 확인할 항목은 투명 배경, 반복 타일 가장자리, 캐릭터 얼굴의 과도한 왜곡, 밀짚모자 아래 머리카락 노출, 가방이 신체와 분리되어 보이는 문제다.

### I02. Manifest와 로더 계약

- Related Files:
  - `src/content/assets/playerAssets.ts` :: `playerAssetKeys`, `playerAssetDescriptions` — 플레이어 key와 설명 확장; modify
  - `src/content/assets/gameAssets.ts` :: `gameAssetKeys`, `gameAssetDefinitions` — 전체 콘텐츠 key 선언; new
  - `src/services/assetRegistry.ts` :: `AssetDefinition`, `assetRegistry` — Phaser 로딩 source of truth; modify
  - `src/game/scenes/BootScene.ts` :: `preload`, `create` — manifest 로드 및 오류 표시; modify
  - `src/game/PhaserGame.ts` :: `createPhaserGame` — asset 로딩 전 RunScene 시작 방지; modify

#### Details

- `AssetDefinition`을 다음 계약으로 확장한다.

  ```typescript
  export interface AssetDefinition {
    key: string;
    path: string;
    kind: 'image' | 'spritesheet' | 'audio';
    frameWidth?: number;
    frameHeight?: number;
    frameCount?: number;
  }
  ```

- `assetRegistry`에는 플레이어 sprite sheet, 제트팩 flame/aura, 3종 item, 3종 obstacle, 5구간×3레이어 배경 및 지하철 하위 장면 key를 모두 등록한다. 같은 key가 중복되거나 `path`가 `/assets/`로 시작하지 않으면 모듈 로드 시 테스트가 실패해야 한다.
- `BootScene.preload()`은 `kind`에 따라 `this.load.image`, `this.load.spritesheet`, `this.load.audio`를 호출한다. `loaderror`를 받아 사용자에게 “게임 에셋을 불러오지 못했습니다” 상태를 전달하고, 로드 완료 전에는 `onReady`를 호출하지 않는다.
- `gameAssets.ts`는 경로 문자열을 각 feature 파일에 흩뿌리지 않고 key만 export한다. `PlayerEntity`, `ItemEntity`, `BackgroundController`, `ObstacleEntity`는 이 key를 import한다.

### I03. 에셋 계약 테스트와 저장소 위생

- Related Files:
  - `src/services/assetRegistry.test.ts` :: manifest validation tests — new
  - `scripts/validate-assets.mjs` :: 경로 존재/원본 사진 패턴 검사 — new
  - `package.json` :: `validate:assets` script — modify

#### Details

- 테스트는 다음을 검증한다: key uniqueness, 모든 path의 `public/` 파일 존재, spritesheet frame metadata 양수, 필수 콘텐츠 key 누락 없음, 원본 사진 확장자/파일명(예: `IMG_*`, `photo*`)이 `public/assets`에 없음.
- `npm run validate:assets`는 생성된 assets를 검사하고 누락 시 1이 아닌 exit code로 종료한다. 원본 얼굴 사진을 테스트 fixture로 복사하지 말고, 생성 일러스트의 파일만 검사한다.

## Acceptance Criteria

- [ ] `public/assets` 아래에 캐릭터·아이템·장애물·5구간 배경 에셋이 콘텐츠별로 존재한다.
- [ ] `assetRegistry`가 비어 있지 않고 모든 required key/path/frame metadata가 검증된다.
- [ ] BootScene이 에셋 preload 완료 후에만 `RunScene`과 `onReady`를 시작한다.
- [ ] 첨부 사진 원본이 저장소나 build output에 들어가지 않는다.
- [ ] 현재 mock 로그인 후 게임 진입이 에셋 404 없이 동작한다.

## Validation

- `npm run validate:assets` — 모든 asset path와 key 검사 통과
- `npm run test:run -- src/services/assetRegistry.test.ts` — manifest 테스트 통과
- `npm run typecheck` — TypeScript 오류 없음
- `npm run build` — Vite build 성공, asset 파일이 output에 포함

## Commit Message

```text
feat(assets): add playable 5pm rush asset manifest

Plan: 2026-11-01-5pm-rush-playable-content
Phase: P01-visual-asset-foundation
Task: T01-asset-manifest-and-generation

- add illustrated player, item, obstacle, and segment background assets
- load and validate all game assets before starting RunScene
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: pending

