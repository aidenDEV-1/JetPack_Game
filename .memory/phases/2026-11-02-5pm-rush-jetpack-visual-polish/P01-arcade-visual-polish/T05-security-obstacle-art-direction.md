# Task: T05 Security Obstacle Art Direction

## Status: pending

## Goal

현재 보라색 구형 `monster`가 배경과 이질적으로 보이는 문제를 해결하고, 회사 내부 보안 시스템이라는 세계관에 맞는 금속 보안 드론·전기 충격 드론·유도 미사일·회전형 전기 장애물로 장애물 아트를 통일한다. 기존 `ObstacleSpawner`의 랜덤 생성, 1100m shield 선행 forced pattern, 충돌 outcome은 유지하면서 visual id와 motion만 콘텐츠 설정으로 분리한다.

## Decision Summary

- 게임 규칙 호환성을 위해 기존 `ObstacleKind`와 `monster` collision category는 유지할 수 있지만, 화면에 표시하는 이름/asset은 `security-drone`으로 교체한다. visual id를 pattern data에 두어 이후 새 장애물을 enum/충돌 로직과 독립적으로 추가한다.
- 모든 장애물은 짙은 navy/metal body, 선명한 outline, cyan/red energy core, 제한된 glow를 사용하고 배경과 분리되는 최소 표시 크기를 가진다.

## Implementation

### I01. obstacle visual catalog와 새 sprite sheet

- Related Files:
  - `public/assets/obstacles/obstacles-spritesheet.png` :: 보안 장애물 6-frame transparent sheet; modify
  - `src/features/obstacles/obstacleTypes.ts` :: `ObstacleVisualId`, `ObstacleMotionSpec`, pattern fields; modify
  - `src/features/obstacles/obstaclePatterns.ts` :: pattern visual/motion definitions; modify
  - `src/features/obstacles/ObstacleEntity.ts` :: visual frame catalog and child rendering; modify
  - `src/content/assets/gameAssets.ts` :: obstacle sheet metadata; modify only to match generated sheet
  - `scripts/validate-assets.mjs` :: frame metadata guard; modify

#### Details

- **Asset Contract**:
  - `obstacles-spritesheet.png`는 기존 `1536×1024 RGBA`, `512×512` frame 6개 계약을 유지한다. 바깥 alpha는 0이다.
  - frame mapping은 다음으로 고정한다: frame 0 `security-drone`, frame 1 `electro-drone`, frame 2 `missile`, frame 3 `rotor`, frame 4 `warning missile variant`, frame 5 `legacy fallback not rendered`. 실제 runtime은 frame 5를 일반 monster로 사용하지 않는다.
  - 에셋에는 checkerboard, 사진 배경, 보라색 sphere-only silhouette를 포함하지 않는다. glow는 작은 core/outline 중심으로 두고 큰 blur 원을 baking하지 않는다.
- **Signatures & Types**:
  ```typescript
  export type ObstacleVisualId = 'security-drone' | 'electro-drone' | 'missile' | 'rotor';
  export type ObstacleMotionType = 'straight' | 'hover' | 'sway' | 'spin';

  export interface ObstacleMotionSpec {
    type: ObstacleMotionType;
    amplitudePx: number;
    periodMs: number;
    rotationDegPerSecond: number;
  }

  export interface ObstaclePattern {
    id: string;
    kind: ObstacleKind;
    visualId: ObstacleVisualId;
    motion: ObstacleMotionSpec;
    requiresShield: boolean;
    warningArrow: boolean;
    width: number;
    height: number;
    displayWidth: number;
    displayHeight: number;
    accentColor: number;
    warningColor: number;
    laserSpan?: LaserSpanSpec;
    laserVisual?: LaserVisualSpec;
  }
  ```
- 보안 드론은 display 118–132px, electro-drone/rotor는 100–128px, missile은 128px를 기준으로 하되 collision `width/height`는 기존보다 갑자기 커지지 않게 별도 지정한다. visual outline/glow는 collision bounds에 포함하지 않는다.

### I02. ObstacleEntity motion와 visual renderer

- Related Files:
  - `src/features/obstacles/ObstacleEntity.ts` :: `createSpriteHazard`, `updateVisual`, `getVisualDebugSnapshot`; modify
  - `src/features/obstacles/ObstacleField.ts` :: obstacle update loop; modify
  - `src/features/obstacles/ObstacleSpawner.ts` :: pattern selection; modify only for new regular patterns
  - `src/features/obstacles/ObstacleWarningIndicator.ts` :: right-edge warning compatibility; read-only unless warning color/icon needs refresh

#### Details

- **Signatures & Types**:
  ```typescript
  export class ObstacleEntity extends Phaser.GameObjects.Container {
    public updateVisual(timeMs: number, viewportWidth: number): void;
    public getCollisionBoundsList(): readonly Phaser.Geom.Rectangle[];
    public getVisualDebugSnapshot(): ObstacleVisualDebugSnapshot;
  }

  export interface ObstacleVisualDebugSnapshot {
    kind: string;
    visualId: ObstacleVisualId;
    motion: ObstacleMotionType;
    displayWidth: number;
    displayHeight: number;
    collisionBounds: Array<{ x: number; y: number; width: number; height: number }>;
    warning: ObstacleWarningSnapshot;
  }
  ```
- `createSpriteHazard()`는 sprite + small outline/core accent child를 `ObstacleEntity` local container에 넣는다. `monster` kind가 화면에 `monster`/보라색 구로 나타나지 않도록 `visualId`를 frame catalog로 사용한다.
- `hover/sway/spin`은 `elapsedMs`를 누적해 hazard local child의 y/angle만 변경한다. world x 이동은 기존 `ObstacleField`가 담당하고, motion이 player collision rectangle을 직접 수정하지 않게 한다.
- `updateVisual()`은 warning indicator와 motion/energy pulse를 함께 갱신한다. 매 frame 새 sprite/Graphics를 만들지 않고 기존 child를 수정한다.
- 미사일은 기존 직선 추적 장애물의 이동/충돌 semantics를 보존하며, 보안 드론/전기 드론/rotor에만 미세 부유·회전 animation을 추가한다. `forced-crossfire`는 `horizontal-laser`와 shield contract를 그대로 유지한다.

### I03. spawn pattern과 collision regression

- Related Files:
  - `src/features/obstacles/obstaclePatterns.ts` :: regular security patterns; modify
  - `src/features/obstacles/ObstacleSpawner.ts` :: regular pool/forced pattern; modify
  - `src/features/obstacles/__tests__/ObstacleField.test.ts` :: forced shield rules; modify only add visual/motion assertions
  - `src/features/obstacles/obstaclePatterns.test.ts` :: pattern validity; modify
  - `tests/e2e/obstacle.spec.ts` :: visible security obstacle screenshot; modify

#### Details

- regular pattern pool에는 `security-drone`, `electro-drone`, `missile`, `rotor` visual을 포함하되, `requiresShield === true`인 forced pattern은 regular pool에서 제외한다.
- `distanceMeters < 1100`, shield pickup 없음, segment 이미 사용됨 조건에서는 forced pattern을 선택하지 않는다. 새 visual 추가가 `ObstacleSpawner.canUseForcedPattern()` 결과를 바꾸면 안 된다.
- unit test는 모든 pattern의 `visualId`가 catalog에 존재하고 display dimensions가 양수이며 collision bounds가 display glow보다 작거나 같은지 확인한다.
- E2E는 `spawnDemoObstacle()`로 security drone이 보이는 화면을 캡처하고, snapshot에서 `visualId !== 'legacy-monster'`, motion type, warning 위치, collision bounds를 검증한다.

## Acceptance Criteria

- [ ] 보라색 구형 몬스터가 화면에 나타나지 않고 보안 시스템 아트로 대체된다.
- [ ] 보안 드론/전기 드론/미사일/회전 장애물이 동일한 navy-metal-energy-core 아트 디렉션을 사용한다.
- [ ] 드론 부유와 rotor 회전은 기존 x 이동/충돌을 깨뜨리지 않는다.
- [ ] 1100m shield-gated forced pattern과 모든 기존 collision outcomes가 유지된다.

## Validation

- `npm run typecheck && npm run lint` — obstacle visual/motion type 검사 통과.
- `npm run validate:assets` — 6-frame obstacle sheet와 원본 asset guard 통과.
- `npm run test:run -- src/features/obstacles/__tests__/ObstacleField.test.ts src/features/obstacles/obstaclePatterns.test.ts src/features/obstacles/__tests__/CollisionResolver.test.ts` — spawn/collision regression 통과.
- `VITE_ENABLE_DEV_MOCK_AUTH=true npx playwright test tests/e2e/obstacle.spec.ts --workers=1` — security obstacle/warning/laser 화면 통과.

## Commit Message

```text
feat(obstacles): align security hazard art direction

Plan: 2026-11-02-5pm-rush-jetpack-visual-polish
Phase: P01-arcade-visual-polish
Task: T05-security-obstacle-art-direction

- replace monster visuals with security obstacle catalog and motion
- preserve shield-gated spawn and collision rules
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
