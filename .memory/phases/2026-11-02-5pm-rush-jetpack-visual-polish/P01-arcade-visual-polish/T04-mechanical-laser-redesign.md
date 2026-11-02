# Task: T04 Mechanical Laser Redesign

## Status: done ✅

## Goal

현재 단순하고 두꺼운 색상 막대인 레이저를 회사 보안 시설의 기계식 장치로 바꾼다. 양 끝 금속 emitter, 얇은 밝은 core, 제한된 glow, 충전/활성 pulse와 작은 spark를 같은 `ObstacleEntity` child 계층에 배치하고, 수직/수평 full/fixed/random span과 실제 collision footprint가 계속 일치하게 한다.

## Decision Summary

- 기존 `LaserSpanSpec`/`ResolvedLaserGeometry`를 유지하고 레이저 길이는 spawn 시 한 번 resolve한다. 표시용 glow/emitter/spark는 collision bounds에 넣지 않는다.
- 레이저는 `beamWidth <= 16`, `coreWidth <= 4`, `glowWidth <= 32`로 제한해 화면을 가리지 않게 하며, 위험 표시는 `ObstacleWarningIndicator`가 담당한다.

## Implementation

### I01. 레이저 visual contract와 asset

- Related Files:
  - `public/assets/obstacles/laser-emitter.png` :: 양 끝 금속 보안 emitter, 투명 PNG; modify
  - `src/features/obstacles/obstacleTypes.ts` :: `LaserVisualSpec`, `LaserActivity`, `ObstaclePattern`; modify
  - `src/features/obstacles/obstaclePatterns.ts` :: red/blue laser pattern values; modify
  - `src/features/obstacles/laserSpanResolver.ts` :: resolved geometry; read-only unless type fields need forwarding
  - `src/content/assets/gameAssets.ts` :: emitter metadata; read-only unless a spark asset is added
  - `scripts/validate-assets.mjs` :: emitter dimensions/required asset guard; modify if needed

#### Details

- **Signatures & Types**:
  ```typescript
  export type LaserActivity = 'charging' | 'active';

  export interface LaserVisualSpec {
    beamWidth: number;       // <= 16
    coreWidth: number;       // <= 4
    glowWidth: number;       // <= 32
    glowColor: number;
    beamColor: number;
    coreColor: number;
    emitterColor: number;
    emitterFrame: number;
    emitterWidth: number;
    emitterHeight: number;
    chargeDurationMs: number;
    sparkColor: number;
  }
  ```
- `laser-emitter.png`는 `256×256 RGBA`에서 금속 링/볼트/에너지 코어가 명확하고 외부 alpha 0인 asset으로 교체한다. 색상 tint만으로 보라색 구형 또는 단순 원이 되지 않게 한다.
- RED laser는 warm red beam/white core/orange-red emitter, BLUE laser는 electric blue beam/white-cyan core/cyan emitter를 사용한다. 두 색상 모두 office/security/subway 배경보다 명도가 높고 outline이 분리되어야 한다.
- 기존 `vertical-laser`, `vertical-laser-full`, `horizontal-laser`, `horizontal-laser-full`, `forced-crossfire` id와 `LaserSpanSpec` semantics는 유지한다. full span은 viewport margin을 포함한 resolved length, fixed/random은 spawn-time resolved length를 snapshot으로 제공한다.

### I02. LaserHazardVisual 렌더링과 animation

- Related Files:
  - `src/features/obstacles/LaserHazardVisual.ts` :: beam/core/glow/emitter child renderer; modify
  - `src/features/obstacles/ObstacleEntity.ts` :: hazard visual update, display dimensions, hitboxes; modify
  - `src/features/obstacles/ObstacleField.ts` :: update loop passes time; modify
  - `src/features/obstacles/ObstacleWarningIndicator.ts` :: right-edge warning; modify only if warning state contract needs visual sync

#### Details

- **Signatures & Types**:
  ```typescript
  export class LaserHazardVisual extends Phaser.GameObjects.Container {
    public update(timeMs: number): void;
    public setActivity(activity: LaserActivity): void;
    public getDisplayBounds(): Phaser.Geom.Rectangle;
  }

  export class ObstacleEntity extends Phaser.GameObjects.Container {
    public updateVisual(timeMs: number, viewportWidth: number): void;
    public getCollisionBoundsList(): readonly Phaser.Geom.Rectangle[];
  }
  ```
- child order는 `glow Graphics → beam Graphics → core Graphics → start emitter → end emitter → spark visuals`이며 모두 `LaserHazardVisual` container 안에만 둔다. `scene.add.graphics()`로 scene root에 레이저 장식을 만들지 않는다.
- `charging`에서는 emitter core가 낮은 alpha로 pulse하고 작은 sparks가 짧게 나타난다. `active`에서는 beam/core가 선명해지고 emitter energy ring이 pulse한다. beam 자체는 화면을 가리지 않도록 위 visual width 제한을 지킨다.
- spark는 animation frame마다 새 `Graphics`/image를 추가하지 않고 bounded child/emitter를 재사용한다. `update(timeMs)`는 alpha/scale/rotation만 변경한다.
- `ObstacleField.update()`가 각 obstacle의 `updateVisual(this.scene.time.now, this.scene.scale.width)`를 호출한다. warning indicator는 기존처럼 장애물이 viewport right edge에 있을 때 `← 위험`을 깜빡이되, warning panel 자체는 collision list에 포함하지 않는다.

### I03. 표시 크기와 collision geometry 검증

- Related Files:
  - `src/features/obstacles/ObstacleEntity.ts` :: `createHitboxes`, `getVisualDebugSnapshot`; modify
  - `src/features/obstacles/laserSpanResolver.ts` :: geometry resolution; read-only
  - `src/features/obstacles/__tests__/ObstacleField.test.ts` :: collision priority; read-only unless new visual contract test is added
  - `src/features/obstacles/laserSpanResolver.test.ts` :: full/fixed/random lengths; modify
  - `tests/e2e/obstacle.spec.ts` :: laser/warning screenshots; modify

#### Details

- vertical collision bounds는 `{ x: -beamWidth/2, y: geometry.start, width: beamWidth, height: collisionLength }`, horizontal은 `{ x: geometry.start, y: -beamWidth/2, width: collisionLength, height: beamWidth }` 형태를 유지한다. glowWidth/emitter size를 collision에 섞지 않는다.
- `getVisualDebugSnapshot()`에 `activity`, `beamWidth`, `coreWidth`, `glowWidth`, `emitterCount`, `resolvedLength`, `collisionLength`를 포함한다. full span의 resolved length가 화면에 그려진 beam length와 일치하는지 검증한다.
- forced crossfire는 두 beam geometry/hitbox를 유지하고 shield/invincible collision outcome을 바꾸지 않는다.

## Acceptance Criteria

- [ ] 수직·수평 레이저 양 끝에 금속 emitter와 밝은 core가 보인다.
- [ ] charging/active 상태가 색상·pulse로 구분되고 작은 spark가 과도하게 누적되지 않는다.
- [ ] full/fixed/random span과 실제 beam/collision 길이가 일치한다.
- [ ] glow, emitter, warning panel은 충돌하지 않고 beam footprint만 충돌한다.

## Validation

- `npm run typecheck && npm run lint` — laser visual/obstacle types 통과.
- `npm run test:run -- src/features/obstacles/laserSpanResolver.test.ts src/features/obstacles/__tests__/ObstacleField.test.ts` — span/collision rules 통과.
- `npm run validate:assets` — emitter asset와 dimensions guard 통과.
- `VITE_ENABLE_DEV_MOCK_AUTH=true npx playwright test tests/e2e/obstacle.spec.ts --workers=1` — vertical full span, horizontal span, right warning screenshot 통과.

## Commit Message

```text
feat(obstacles): render mechanical laser hazards

Plan: 2026-11-02-5pm-rush-jetpack-visual-polish
Phase: P01-arcade-visual-polish
Task: T04-mechanical-laser-redesign

- add metal emitters, thin laser cores, charge pulses, and sparks
- keep visual glow separate from collision geometry
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: `dea2448`
