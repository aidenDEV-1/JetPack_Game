# Task: T01 Player Render Isolation

## Status: done ✅

## Goal

1280×720 실제 플레이 화면에서 캐릭터 외곽의 반투명 사각형, 중복 body sprite, debug rectangle, trail/afterimage 잔류가 전혀 보이지 않도록 플레이어 asset과 Phaser Container 계층을 정리한다. 캐릭터의 실제 몸체만 렌더링하고 기존 `PLAYER_COLLISION_BOUNDS`는 물리 계산용으로만 유지해, 이후 애니메이션과 제트팩 VFX가 잘못된 부모에 붙지 않는 기반을 만든다.

## Decision Summary

- `PlayerEntity`는 월드에 등록되는 유일한 player root이고, body sprite와 `JetpackAttachment`만 child로 가진다. child를 생성할 때 `scene.make.*({ add: false })`를 사용해 Phaser display list에 중복 root를 만들지 않는다.
- 고정 384×170 frame 셀의 바깥 영역은 알파 0인 투명 PNG로 유지한다. collision rectangle은 표시하지 않고 debug snapshot으로만 관찰한다.

## Implementation

### I01. 투명 캐릭터 asset과 registry 계약

- Related Files:
  - `public/assets/player/player-spritesheet.png` :: 7개 애니메이션 상태를 담는 최종 게임용 투명 spritesheet; modify
  - `src/content/assets/gameAssets.ts` :: `gameAssetDefinitions`, `gameAssetKeys`; modify
  - `src/services/assetRegistry.ts` :: asset registry export; read-only unless metadata forwarding is required
  - `scripts/validate-assets.mjs` :: 필수 asset/원본 사진 파일명 guard; modify
  - `src/features/player/playerAssetConfig.ts` :: frame/scale/anchor/collision 상수; modify

#### Details

- **Asset Contract**:
  - 파일은 `1536×1190 RGBA PNG`이다.
  - 각 frame은 `384×170`, 총 `28`개이며, 모든 frame의 기준점은 같은 셀 중심과 같은 플레이어 기준선에 맞춘다.
  - 각 frame의 캐릭터·모자·가방·불꽃만 alpha `> 0`이고 셀의 나머지 픽셀은 alpha `0`이다. 흰 checkerboard, 사진 배경, 반투명 직사각형 matte를 저장하지 않는다.
  - 얼굴·안경·밀짚모자·수트 인상은 현재 승인된 `player-spritesheet.png`를 유지하고, 새 frame이 필요하면 같은 캐릭터를 기준으로 imagegen skill을 사용해 일러스트를 생성한 뒤 투명화한다. 원본 사진 파일은 입력으로만 참고하고 저장소에 복사하지 않는다.
- **Signatures & Types**:
  ```typescript
  export const PLAYER_FRAME_WIDTH = 384;
  export const PLAYER_FRAME_HEIGHT = 170;
  export const PLAYER_FRAME_COUNT = 28;
  export const PLAYER_SPRITE_SCALE = 0.5;
  export const PLAYER_JETPACK_ANCHOR = { x: -78, y: 18 } as const;
  export const PLAYER_COLLISION_BOUNDS = { x: -42, y: -30, width: 84, height: 68 } as const;
  ```
- `gameAssetDefinitions`의 player entry를 `frameHeight: 170`, `frameCount: 28`로 맞추고, 다른 asset의 frame metadata를 임의로 바꾸지 않는다. frame metadata와 실제 PNG dimensions가 다르면 BootScene이 조용히 잘못된 셀을 읽으므로 T01에서 실패시킨다.
- `validate-assets.mjs`에는 player sheet 존재/원본 사진 파일명 검사와 `frameCount` metadata 계약 검사를 추가한다. 기존 `IMG_`, `photo`, `original`, `face` filename guard는 유지한다.

#### Execution Flow / Logic

1. Precondition & Validation: 현재 `player-spritesheet.png`가 RGBA이고 384×170 grid인지 확인하고, 승인된 얼굴 디자인과 셀별 기준선 정보를 보존한다.
2. Core Processing: 28 frame sheet를 7 row × 4 frame으로 배치하고 frame 외부 alpha를 0으로 정리한다. `gameAssetDefinitions`는 이 dimensions를 단일 source of truth로 참조한다.
3. Error & Exception Handling: frame count/dimensions 불일치, asset load error, 원본 사진 유사 파일명 발견 시 `validate:assets` 또는 BootScene load error를 실패시킨다. 임의의 다른 상태 frame으로 fallback하지 않는다.
4. State Transition & Return: asset registry가 새 metadata를 반환하고, player runtime은 기존 `PLAYER_COLLISION_BOUNDS`로만 충돌을 계산한다.

### I02. Phaser player 계층과 debug 계약

- Related Files:
  - `src/features/player/PlayerEntity.ts` :: `PlayerEntity`, `getVisualDebugSnapshot`; modify
  - `src/features/player/JetpackAttachment.ts` :: attachment child root; modify only where duplicate registration or trail child exists
  - `src/game/test/GameTestApi.ts` :: development-only visual snapshot type; modify
  - `src/features/player/__tests__/PlayerEntity.test.ts` :: render/anchor contract tests; modify
  - `tests/e2e/booster.spec.ts` :: player visual regression assertions; modify

#### Details

- **Required hierarchy**:
  ```text
  Phaser Scene display list
  └─ PlayerEntity (one world root)
     ├─ JetpackAttachment (one local child)
     └─ player body Sprite (one local child)
  ```
- `PlayerEntity` constructor는 `scene.add.existing(this)`를 한 번만 호출하고, body는 다음 계약을 지킨다.
  ```typescript
  scene.make.sprite({ key: gameAssetKeys.playerSheet, frame: 0, add: false });
  ```
  `scene.add.sprite`, `scene.add.image`, `scene.add.graphics`, `RenderTexture`, CSS rectangle을 player body 표시용으로 사용하지 않는다.
- `JetpackAttachment`의 form sprite도 `add: false`로 만든 후 attachment container에만 추가한다. T01에서는 로켓 VFX의 최종 디자인을 바꾸지 않고, 월드 detached root가 없는지 확인한다.
- `PlayerVisualDebugSnapshot`에 다음 관찰 필드를 추가한다.
  ```typescript
  export interface PlayerVisualDebugSnapshot {
    collisionBounds: { x: number; y: number; width: number; height: number };
    renderRootCount: number;
    playerChildCount: number;
    jetpackAttachmentCount: number;
    hasDebugBounds: boolean;
    hasPersistentTrail: boolean;
    hasDetachedBoosterRoot: false;
    bodyTextureKey: string;
  }
  ```
- `renderRootCount`는 PlayerEntity 자신이 Phaser display list에 한 번만 존재함을 나타내고, `playerChildCount`는 body/attachment의 두 child 계약을 검증한다. hitbox는 계산 객체일 뿐 `Graphics` child로 등록하지 않는다.
- crash 회전과 gray tint는 유지하되, crash 종료 후에도 body sprite가 하나만 남고 reset 시 detached child/trail을 재사용하지 않도록 한다.

### I03. 회귀 테스트

- Related Files:
  - `src/features/player/__tests__/PlayerEntity.test.ts` :: `PlayerAnimationController`와 player constants test; modify
  - `tests/e2e/booster.spec.ts` :: mock 로그인 후 player visual snapshot/screenshot; modify
  - `tests/e2e/production-guard.spec.ts` :: test API/mock auth/original asset guard; read-only unless new asset name requires a narrow assertion

#### Details

- unit test는 `PLAYER_COLLISION_BOUNDS` 값이 기존 `{ x: -42, y: -30, width: 84, height: 68 }`임을 확인하고, `PLAYER_JETPACK_ANCHOR`가 collision bounds 바깥에 있더라도 표시 hitbox가 확장되지 않는지 검증한다.
- E2E는 부스터 중 `renderRootCount === 1`, `playerChildCount === 2`, `jetpackAttachmentCount === 1`, `hasDebugBounds === false`, `hasPersistentTrail === false`, `hasDetachedBoosterRoot === false`를 검증하고 `rocket-booster-isolated.png`를 캡처한다.
- screenshot은 색상/배경만으로 성공 처리하지 않는다. snapshot과 함께 player body texture key, collision bounds, child count를 검사한다.

## Acceptance Criteria

- [ ] 캐릭터 주변에 직사각형 배경, debug hitbox, 중복 캐릭터 root, 누적 trail이 보이지 않는다.
- [ ] player PNG는 1536×1190 RGBA, 384×170 × 28 frame 계약을 만족하고 프레임 외부 alpha가 0이다.
- [ ] `PlayerEntity`는 하나의 world root와 body/jetpack 두 local child만 가지며, collision bounds는 렌더링되지 않는다.
- [ ] 얼굴·밀짚모자 디자인과 기존 이동/충돌 좌표는 변하지 않는다.

## Validation

- `npm run validate:assets` — player metadata, 필수 asset, 원본 사진 파일명 guard 통과.
- `npm run typecheck` — PlayerEntity/GameTestApi 타입 검사 통과.
- `npm run test:run -- src/features/player/__tests__/PlayerEntity.test.ts` — player render/anchor contract 통과.
- `VITE_ENABLE_DEV_MOCK_AUTH=true npx playwright test tests/e2e/booster.spec.ts --workers=1` — isolated player screenshot과 snapshot 통과.
- `git diff --check` — 공백/patch 오류 없음.

## Commit Message

```text
fix(player): isolate transparent character render

Plan: 2026-11-02-5pm-rush-jetpack-visual-polish
Phase: P01-arcade-visual-polish
Task: T01-player-render-isolation

- enforce transparent 28-frame player asset metadata
- remove duplicate player roots and keep hitboxes render-free
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: pending
