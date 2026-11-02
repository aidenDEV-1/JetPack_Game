# Task: T03 Obstacle Visibility and Warning

## Status: done ✅

## Goal

레이저·미사일·몬스터가 배경 속에 묻히지 않도록 화면 표시 크기와 색 대비를 높이고, warning 대상이 화면 우측 끝에서 접근 중임을 깜빡이는 경고로 미리 알려준다. 장애물의 시각 변경이 기존 랜덤 패턴·충돌·방어막·난이도 구간 규칙을 바꾸지 않게 하는 것이 목적이다.

## Decision Summary

- `ObstaclePattern`에 collision footprint와 display footprint를 분리한 필드 및 강조 색을 추가한다. 표시를 키우되 collision bounds는 패턴별로 명시해 난이도가 암묵적으로 변하지 않게 한다.
- 기존 obstacle child 안의 `← 위험` 텍스트를 장애물과 함께 이동시키지 않고, `ObstacleWarningIndicator`를 화면 우측 고정 좌표에 렌더링한다. 표시 대상이 우측 화면 밖에서 접근하는 동안만 pulse/blink한다.

## Implementation

### I01. 장애물 시각 스펙과 대비

- Related Files:
  - `src/features/obstacles/obstacleTypes.ts` :: `ObstaclePattern` — display/collision/color 필드 계약; modify
  - `src/features/obstacles/obstaclePatterns.ts` :: `obstaclePatterns` — 레이저·미사일·몬스터 표시 크기와 색 지정; modify
  - `src/features/obstacles/ObstacleEntity.ts` :: `createHazard`, `createHitboxes`, `getCollisionBoundsList` — display size/tint와 collision footprint 분리; modify
  - `src/content/assets/gameAssets.ts` :: `gameAssetKeys.obstaclesSheet` — 기존 장애물 spritesheet frame 계약 확인; read-only
  - `src/features/obstacles/CollisionResolver.ts` :: collision outcome 규칙 확인; read-only

#### Details

- **Signatures & Types**:

  ```typescript
  export interface ObstaclePattern {
    id: string;
    kind: ObstacleKind;
    requiresShield: boolean;
    warningArrow: boolean;
    width: number;
    height: number;
    displayWidth: number;
    displayHeight: number;
    accentColor: number;
    warningColor: number;
  }
  ```

- **Required Visual Baseline**:
  - vertical laser: collision `42×500` 이상을 유지하고 display width를 기존보다 넓혀 발광 선이 한눈에 보이게 한다.
  - horizontal laser: display footprint를 최소 `420×48` 수준으로 키우고 red/orange tint와 밝은 core line을 유지한다.
  - missile: display footprint를 최소 `128×48` 수준으로 키우고 `#ff5a5f`/amber 대비를 적용한다.
  - monster: display footprint를 최소 `112×112` 수준으로 키우고 배경의 blue/navy와 대비되는 magenta/red outline 또는 tint를 사용한다.
  - forced crossfire: 두 레이저의 display footprint를 키우되 `requiresShield=true`, `distanceMeters >= 1100`, segment당 1회 규칙은 그대로 둔다.

- **Execution Flow / Logic**:
  1. Precondition & Validation: `ObstacleSpawner`가 참조하는 모든 pattern에 새 필드가 존재하는지 확인하고, `warningArrow`가 true인 기존 missile 패턴이 계속 warning 대상인지 확인한다.
  2. Core Processing: `createHazard`는 sprite/container에 `displayWidth/displayHeight`와 `accentColor`를 적용하고, `createHitboxes`는 `width/height`만 사용한다. 화면에 보이는 외곽 glow는 collision rectangle로 등록하지 않는다.
  3. Error & Exception Handling: missing frame/tint가 발생해도 투명 사각형 placeholder를 추가하지 않으며 기존 BootScene asset load error를 사용한다. destroy 시 hazard와 warning indicator를 함께 정리해 매 spawn마다 남는 object가 없게 한다.
  4. State Transition & Return: obstacle가 spawn되면 warning indicator가 우측에 `visible=true`가 되고, obstacle이 우측 warning threshold를 지나면 indicator가 `visible=false`가 된다. obstacle reset/offscreen/crash 시 indicator도 즉시 destroy/hide된다.

### I02. 우측 가장자리 warning indicator

- Related Files:
  - `src/features/obstacles/ObstacleWarningIndicator.ts` :: `ObstacleWarningIndicator` — 우측 고정 경고 표시; new
  - `src/features/obstacles/ObstacleEntity.ts` :: `updateWarning`, `destroy` — obstacle 접근 상태와 indicator lifecycle 연결; modify
  - `src/features/obstacles/ObstacleField.ts` :: `update` — 매 frame warning 위치/visibility 갱신; modify
  - `src/styles/tokens.css` :: canvas 바깥 React HUD 스타일과 충돌하지 않는 z-index 참고; read-only unless DOM fallback is required

#### Details

- **Signatures & Types**:

  ```typescript
  export interface ObstacleWarningSnapshot {
    visible: boolean;
    x: number;
    y: number;
    alpha: number;
    label: '← 위험';
  }

  export class ObstacleWarningIndicator extends Phaser.GameObjects.Container {
    public show(viewportWidth: number, obstacleY: number): void;
    public hide(): void;
    public update(timeMs: number, viewportWidth: number, obstacleY: number): void;
    public snapshot(): ObstacleWarningSnapshot;
  }
  ```

- indicator x는 `viewportWidth - 56` 근처에 고정하고 y는 obstacle y를 `ceilingY + 48`와 `floorY - 48` 사이로 clamp한다. `⚠` 또는 red/amber panel과 굵은 `← 위험` stroke를 함께 사용해 배경과 분리한다.
- pulse는 frame마다 Phaser GameObject를 만들지 않고 `alpha = 0.55 + 0.45 * abs(sin(timeMs * frequency))`와 소폭 scale 변화로 계산한다. obstacle가 `viewportWidth - 220` 안으로 들어오면 hide/fade하여 화면을 가리지 않는다.
- indicator는 collision bounds list에 포함하지 않는다. warning은 예고 기능일 뿐 실제 충돌 판정은 obstacle hazard만 담당한다.

### I03. 장애물 규칙 회귀 테스트

- Related Files:
  - `src/features/obstacles/obstaclePatterns.test.ts` :: pattern display/collision/warning contract — modify
  - `src/features/obstacles/__tests__/ObstacleField.test.ts` :: reset/offscreen/forced pattern lifecycle — modify
  - `tests/e2e/obstacle.spec.ts` :: 우측 warning과 enlarged hazard snapshot/screenshot — modify
  - `src/game/test/GameTestApi.ts` / `src/game/scenes/RunScene.ts` :: dev-only obstacle debug snapshot — modify only for deterministic visual assertions

#### Details

- unit test는 모든 pattern의 `displayWidth >= width`, `displayHeight >= height`, non-zero accentColor를 확인한다.
- missile만 기본 warning target으로 유지되고, forced pattern은 warning 여부와 관계없이 shield-gated 조건을 만족하는지 확인한다.
- E2E는 `spawnDemoObstacle()` 후 obstacle debug snapshot의 `warning.x`가 viewport 오른쪽 끝에 있고 `warning.visible=true`인 순간을 확인한 뒤, hazard가 player와 충돌해 기존 crash flow로 이어지는지 확인한다.

## Acceptance Criteria

- [ ] 장애물이 배경과 충분히 다른 색과 밝기로 보이고, 기존보다 실제 화면 footprint가 커진다.
- [ ] 우측 끝에 `← 위험` warning이 깜빡이며 obstacle 접근을 알리고, 화면 안으로 들어온 뒤 자동으로 사라진다.
- [ ] warning indicator는 collision 대상이 아니며, 장애물 reset/offscreen/crash 후 남지 않는다.
- [ ] random pattern, shield 선행 조건, 1100m 강제 패턴, 기존 충돌 결과는 회귀하지 않는다.

## Validation

- `npm run test:run -- src/features/obstacles` — pattern/field/collision tests 통과
- `npm run typecheck` — pattern/indicator/debug snapshot 타입 오류 없음
- `npx playwright test tests/e2e/obstacle.spec.ts --workers=1` — 우측 warning·충돌·결과 흐름 통과

## Commit Message

```text
feat(obstacles): improve hazard contrast and warnings

Plan: 2026-11-02-5pm-rush-visual-cohesion
Phase: P01-visual-cohesion-and-hazard-clarity
Task: T03-obstacle-visibility-warning

- increase obstacle contrast and display footprints
- show pulsing right-edge warnings before hazards enter the playfield
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: feat(obstacles): improve hazard contrast and warnings
