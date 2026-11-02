# Task: T03 Laser Span and Hazard Visual Redesign

## Status: pending

## Goal

수직·수평 레이저를 현재 단순 tint sprite가 아닌 emitter, 외곽 glow, 밝은 core beam으로 재설계하고, 레이저 길이를 `full`, `fixed`, `random` 데이터로 제어한다. 미사일·몬스터·강제 crossfire도 배경과 분리되는 외곽 대비를 갖게 하되, 표시 장식과 실제 충돌 범위를 분리해 기존 난이도·방어막 규칙을 유지한다.

## Decision Summary

- 레이저는 `Phaser.GameObjects.Container` 안의 procedural `Graphics` beam/core/glow와 endpoint emitter로 렌더링한다. 화면 전체를 덮는 단색 사각형 이미지 하나를 늘리지 않는다.
- 길이와 충돌 geometry는 spawn 순간 한 번 계산해 `ObstacleEntity`가 보관한다. warning indicator·glow·outline은 collision hitbox에 포함하지 않는다.

## Implementation

### I01. 레이저 span 및 hazard visual 데이터 모델

- Related Files:
  - `src/features/obstacles/obstacleTypes.ts` :: `ObstaclePattern`, new `LaserSpanSpec`, `LaserVisualSpec`, `ResolvedLaserGeometry` — 길이·방향·표시·충돌 계약; modify
  - `src/features/obstacles/obstaclePatterns.ts` :: `obstaclePatterns`, `isReachablePattern` — full/fixed/random 레이저와 대비 색상 정의; modify
  - `src/features/obstacles/laserSpanResolver.ts` :: `resolveLaserGeometry` — viewport와 random을 이용한 spawn-time span 계산; new
  - `src/game/config/gameConfig.ts` :: `width`, `ceilingY`, `floorY` — full span 기준 확인; read-only

#### Details

- **Signatures & Types**:

  ```typescript
  export type LaserOrientation = 'vertical' | 'horizontal';
  export type LaserSpanMode = 'full' | 'fixed' | 'random';

  export interface LaserSpanSpec {
    orientation: LaserOrientation;
    mode: LaserSpanMode;
    length?: number;
    minLength?: number;
    maxLength?: number;
    fullSpanChance?: number;
    margin: number;
  }

  export interface LaserVisualSpec {
    beamWidth: number;
    coreWidth: number;
    glowWidth: number;
    glowColor: number;
    beamColor: number;
    coreColor: number;
    emitterColor: number;
    emitterFrame: number;
    emitterWidth: number;
    emitterHeight: number;
  }

  export interface ResolvedLaserGeometry {
    orientation: LaserOrientation;
    length: number;
    collisionLength: number;
    start: number;
    end: number;
    center: { x: number; y: number };
  }

  export function resolveLaserGeometry(
    spec: LaserSpanSpec,
    viewport: { width: number; ceilingY: number; floorY: number },
    random: () => number,
  ): ResolvedLaserGeometry;
  ```

- **Span Rules**:
  - `full` vertical: `length = floorY - ceilingY`, `margin`을 양 끝에 추가하지 않고 ceiling/floor 안쪽에서 끝난다.
  - `full` horizontal: `length = viewport.width + margin * 2`; obstacle container가 우측에서 진입해 플레이 영역 전체를 가로지르도록 한다.
  - `fixed`: `length`를 사용하고 orientation별 최대 playable span으로 clamp한다. `length`가 없으면 에셋 load error가 아니라 타입/단위 테스트 실패로 처리한다.
  - `random`: `minLength`와 `maxLength` 사이를 선택한다. `fullSpanChance`가 있으면 해당 확률로 orientation의 full length를 선택하고, 그 외에는 균등 random을 사용한다. spawn 이후 매 frame 재계산하지 않는다.
  - `collisionLength`는 core beam 폭과 span을 기준으로 계산하며 glow width는 포함하지 않는다. `start/end`는 hazard container local 좌표로 저장한다.

- **Pattern Baseline**:
  - 기존 `vertical-laser`, `horizontal-laser`, `forced-crossfire` id는 유지해 shield-gated 규칙과 테스트 참조를 깨지 않는다.
  - 일반 수직 레이저는 `random`으로 `minLength: 220`, `maxLength: full vertical length`, `fullSpanChance: 0.20`을 사용한다.
  - 일반 수평 레이저는 `random`으로 `minLength: 260`, `maxLength: viewport width`, `fullSpanChance: 0.15`를 사용한다.
  - 필요하면 `vertical-laser-fixed`와 `horizontal-laser-fixed` 패턴을 추가하되, `ObstacleSpawner`의 regular pool에서 선택 가능한 확률을 명시한다. 모든 pattern은 `display/collision` 필드를 갖는다.
  - `forced-crossfire`는 기존처럼 1100m 이후 shield pickup 선행·segment당 1회이며, 두 beam의 gap이 `isReachablePattern`의 minimum gap을 만족하는지 spawn validation을 거친다.
  - 색상은 office/city/subway 배경과 구분되는 `glowColor`, `beamColor`, `coreColor`를 갖는다. red/orange core와 blue/white alternate를 사용할 수 있지만 배경 tint와 동일한 navy/gray는 금지한다.

- **Execution Flow / Logic**:
  1. Precondition & Validation: 모든 laser pattern에 `laserSpan`과 `laserVisual`이 있고, full/fixed/random mode의 필수 값이 유효한지 검사한다. `fullSpanChance`는 `0..1`로 clamp한다.
  2. Core Processing: `ObstacleField.spawn()`이 `resolveLaserGeometry()`를 한 번 호출해 `ObstacleEntity`에 넘긴다. `ObstacleEntity`는 resolved geometry를 사용해 visual과 hitbox를 동시에 생성한다.
  3. Error & Exception Handling: 잘못된 span은 0 길이 beam이나 화면 전체 crash hitbox로 fallback하지 않고 명시적 validation error로 실패한다. 랜덤 함수가 0/1 경계를 반환해도 min/max 범위를 벗어나지 않는다.
  4. State Transition & Return: obstacle reset/offscreen/destroy 시 graphics, emitter sprite, warning indicator가 모두 함께 정리되고, 다음 spawn이 이전 geometry를 재사용하지 않는다.

### I02. 레이저 렌더러 및 endpoint emitter

- Related Files:
  - `src/features/obstacles/LaserHazardVisual.ts` :: `LaserHazardVisual`, `LaserHazardVisualConfig` — glow/core/emitter를 렌더링하는 전용 Phaser container; new
  - `src/features/obstacles/ObstacleEntity.ts` :: `createHazard`, `createHitboxes`, `destroy`, `getVisualDebugSnapshot` — laser renderer와 resolved collision 연결; modify
  - `src/content/assets/gameAssets.ts` :: `gameAssetKeys.laserEmitter`와 image asset definition — 전용 emitter runtime key; modify
  - `public/assets/obstacles/laser-emitter.png` :: 투명 endpoint emitter 일러스트 — 신규 `256×256` RGBA PNG; new

#### Details

- **Signatures & Types**:

  ```typescript
  export interface LaserHazardVisualConfig {
    geometry: ResolvedLaserGeometry;
    visual: LaserVisualSpec;
    emitterTextureKey: string;
  }

  export class LaserHazardVisual extends Phaser.GameObjects.Container {
    public constructor(scene: Phaser.Scene, config: LaserHazardVisualConfig);
    public getDisplayBounds(): Phaser.Geom.Rectangle;
    public destroy(fromScene?: boolean): void;
  }
  ```

- **Visual Design**:
  - beam layer: low-alpha wide glow, medium-width colored beam, high-alpha thin white/yellow core를 같은 span에 겹친다.
  - endpoint layer: vertical이면 위·아래 emitter, horizontal이면 좌·우 emitter를 beam 끝에 배치한다. 전용 `laser-emitter.png`는 `256×256` 투명 정사각형 안에 emitter module만 포함하고, 화면에서는 `56×56`으로 표시한다. emitter는 beam보다 작은 opaque body와 bright center를 가지며, 회전으로 재사용할 때 중심이 beam 끝에서 어긋나지 않게 한다.
  - full span도 화면 밖까지 무한히 그리지 않고 resolved `start/end`까지만 그린다. glow는 시각적으로 넓지만 collision에는 포함하지 않는다.
  - `LaserHazardVisual`은 Phaser container child로만 생성한다. 매 frame graphics를 새로 만들거나 previous beam을 누적하지 않는다.

- **ObstacleEntity Integration**:
  - `createHazard()`에서 laser kind는 기존 `obstaclesSheet` 단일 sprite 경로 대신 `LaserHazardVisual`을 사용한다. missile/monster는 기존 sprite를 유지하되 high-contrast glow/outline과 `displayWidth/displayHeight`를 pattern에서 읽는다.
  - `createHitboxes()`는 `ResolvedLaserGeometry.collisionLength`와 beam width만 사용한다. emitter, glow, warning panel, outline은 collision list에 넣지 않는다.
  - forced crossfire는 `LaserHazardVisual` 두 개 또는 한 parent container로 만들고, 두 beam의 hitbox를 각각 저장한다. 중앙 gap은 기존 플레이 가능 gap을 유지한다.
  - `getVisualDebugSnapshot()`에 `orientation`, `spanMode`, `resolvedLength`, `collisionLength`, `displayBounds`를 추가하되 gameplay state를 변경하지 않는다.

### I03. 장애물 공통 대비와 warning 연결

- Related Files:
  - `src/features/obstacles/ObstacleWarningIndicator.ts` :: `show`, `hide`, `update`, `setColor` — full/long laser와 missile의 right-edge warning 표시; modify
  - `src/features/obstacles/ObstacleField.ts` :: `spawn`, `update`, `clearDemoObstacles` — resolved span 전달과 lifecycle 유지; modify
  - `src/features/obstacles/ObstacleSpawner.ts` :: `choosePattern` — 새 레이저 pattern pool과 기존 shield rule 유지; modify only if pattern list changes
  - `src/features/obstacles/obstaclePatterns.test.ts` :: pattern visual/span contract — modify

#### Details

- `warningArrow`는 pattern 데이터로 결정한다. 기본 missile warning은 유지하고, full-span 또는 위험도가 높은 laser pattern은 `warningArrow: true`로 설정할 수 있다. warning 대상이 아닌 fixed short laser에는 경고를 강제하지 않는다.
- warning은 계속 `ObstacleWarningIndicator`의 우측 고정 panel에서 `⚠`, `← 위험`, pulse alpha/scale로 표시한다. 장애물 child에 text를 붙여 함께 이동시키지 않는다.
- warning은 장애물이 `viewportWidth - 220` 밖에 있는 동안만 표시하고 화면 안쪽으로 진입하면 hide한다. crash, shield block, offscreen destroy에서도 indicator를 정리한다.
- obstacle tint만으로 대비를 만들지 말고, monster/missile에는 dark outline + bright accent ring을 추가한다. 시각 장식이 collision bounds를 넓히지 않는다는 주석과 테스트를 남긴다.

### I04. 장애물 단위 테스트

- Related Files:
  - `src/features/obstacles/laserSpanResolver.test.ts` :: full/fixed/random boundary tests — new
  - `src/features/obstacles/obstaclePatterns.test.ts` :: pattern display/collision/color/warning contract — modify
  - `src/features/obstacles/__tests__/ObstacleField.test.ts` :: spawn-time geometry/reset/forced crossfire lifecycle — modify
  - `tests/e2e/obstacle.spec.ts` :: real canvas laser display and right warning — modify

#### Details

- resolver가 vertical full span을 `floorY - ceilingY`, horizontal full span을 `viewport.width + margin*2`로 반환하는지 검증한다.
- fixed mode가 입력 길이를 반환하고, random mode가 min/max 범위를 벗어나지 않으며 `fullSpanChance=1`일 때 full length를 반환하는지 검증한다.
- 모든 pattern에서 `displayWidth/displayHeight`가 collision footprint보다 작지 않고, `glowWidth > beamWidth >= coreWidth > 0`, 색상이 배경 기본색과 다른지 검증한다.
- obstacle이 update되는 동안 resolved length와 collision hitbox가 바뀌지 않는지 검증한다.
- forced crossfire는 shield 선행·1100m·segment당 1회·gap 규칙을 유지하고, warning indicator가 collision list에 포함되지 않는지 검증한다.
- E2E는 deterministic test hook으로 short laser, full vertical laser, full horizontal laser, missile warning을 순서대로 생성하고 screenshot/debug snapshot에서 `resolvedLength`, `displayBounds`, warning right-edge를 확인한다.

## Acceptance Criteria

- [ ] 수직·수평 레이저가 emitter + glow + core beam 구조로 보여 기존 단순 tint sprite보다 명확하고 고품질이다.
- [ ] 레이저가 full/fixed/random 길이 중 pattern 설정에 따라 생성되고, spawn 이후 길이가 흔들리지 않는다.
- [ ] 레이저의 표시 glow·emitter·warning은 충돌 판정에 포함되지 않고 실제 beam hitbox만 충돌한다.
- [ ] 미사일·몬스터도 배경과 구분되는 outline/accent를 가지며 기존 충돌 크기·결과 규칙을 유지한다.
- [ ] full-span 또는 설정된 warning 대상은 우측 `← 위험` indicator가 깜빡이고, 화면 진입 후 사라진다.
- [ ] 1100m shield-gated forced crossfire와 플레이 가능한 gap 규칙이 회귀하지 않는다.

## Validation

- `npm run test:run -- src/features/obstacles src/game/systems` — span resolver, pattern, field, collision 단위 테스트 통과.
- `VITE_ENABLE_DEV_MOCK_AUTH=true npx playwright test tests/e2e/obstacle.spec.ts --workers=1` — full/fixed laser, enlarged hazard, right warning, crash flow 통과.
- `npm run typecheck && npm run lint` — Graphics/container lifecycle와 obstacle type 오류 없음.

## Commit Message

```text
feat(obstacles): redesign laser spans and hazard visuals

Plan: 2026-11-02-5pm-rush-rocket-booster-hazard-design
Phase: P01-rocket-booster-and-laser-redesign
Task: T03-laser-span-and-hazard-visual-redesign

- render high-contrast laser cores, glows, and endpoint emitters
- support full, fixed, and random laser spans without changing collision rules
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
