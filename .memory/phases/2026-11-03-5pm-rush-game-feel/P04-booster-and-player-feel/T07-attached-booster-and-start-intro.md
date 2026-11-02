# Task: T07 가방 제트팩 강화형 부스터와 시작 인트로

## Status: pending

## Goal

부스터가 별도 탈것처럼 보이지 않고 캐릭터가 멘 갈색 가방의 노즐이 강화되는 형태로 보이게 한다. 게임 시작 시 5시 벽시계와 알람을 보여주고 1.5초 인트로 후 1.5초 짧은 부스트로 진입한 다음 일반 비행으로 전환한다.

## Decision Summary

- D-A 가방 제트팩 강화형: 플레이어 렌더 루트는 하나이며, 제트팩 불꽃은 `PLAYER_JETPACK_ANCHOR`에서만 발생한다.
- 현재 `booster-forms-spritesheet.png`에 baked horizontal flame이 있으면 제거/재생성하고, 효과는 코드 파티클로만 만든다.

## Implementation

### I01. Booster style and attached flame

- Related Files:
  - `src/game/config/tuning/booster.ts` :: `BOOSTER_TUNING`; modify
  - `src/features/booster/boosterStyleCatalog.ts` :: `BoosterStyleDefinition`; modify
  - `src/features/player/JetpackAttachment.ts` :: `setActivity`; modify
  - `src/features/player/JetpackFlameVisual.ts` :: intensity/length; modify
  - `src/features/player/JetpackSparkEmitter.ts` :: bounded particles; modify
  - `public/assets/player/booster-forms-spritesheet.png` — clean backpack-only frames; modify/new asset

#### Details

```typescript
export interface BoosterTuning {
  introDurationMs: number;
  boostDurationMs: number;
  flameLengthMultiplier: number;
  flameParticleMultiplier: number;
  leanDegrees: number;
  graceDurationMs: number;
}

public setActivity(activity: JetpackActivity): void;
public setBoosterVisual(active: boolean): void;
```

- ordinary flight flame은 normal scale, booster flame은 길이 2~2.5배로 렌더링한다.
- 불꽃 방향은 뒤쪽 아래 방향이며 body 위에 그려지지 않도록 `flame → backpack/form → body → front effects` 순서를 고정한다.
- booster form sprite는 backpack/nozzle만 포함해야 하며 캐릭터·수평 baked flame을 포함하지 않는다.
- `PlayerEntity`에는 booster form을 새 scene root로 추가하지 않는다.

### I02. Start intro

- Related Files:
  - `src/features/start/StartSequence.ts` :: `play`; modify
  - `src/features/start/ClockOverlay.tsx` :: clock/alarm visual; modify
  - `src/app/GameShell.tsx` :: start callback and audio trigger; modify
  - `src/game/scenes/RunScene.ts` :: `beginRun`; modify
  - `src/game/config/tuning/booster.ts` :: intro timings; modify

#### Details

- `StartSequence` 단계: `clock-4:59:59 → clock-5:00:00 + alarm → office-wall-break → short-boost → running`.
- 전체 인트로는 1.5초, 짧은 부스트는 1.5초로 튜닝한다. 시작 버튼을 누르기 전에는 Phaser run state를 `running`으로 바꾸지 않는다.
- `onAlarm`은 P06 AudioController에 연결할 callback을 받되, 이 Task에서 WebAudio 구현을 중복하지 않는다.
- 재시작·취소 시 타이머와 boost state를 reset한다.

### I03. Booster tests and screenshots

- Related Files:
  - `src/features/booster/__tests__/BoosterFlightController.test.ts` — intro/flight phases; modify
  - `src/features/player/__tests__/PlayerEntity.test.ts` — single root/anchor; modify
  - `src/features/start/StartSequence.test.ts` — exact phase timing; modify
  - `tests/e2e/booster.spec.ts` — one player and attached visual; modify
  - `screenshots/T07/` — intro/boost/normal transition; new

## Acceptance Criteria

- [ ] 부스터 중 캐릭터와 제트팩이 하나의 개체처럼 움직이고 별도 캐릭터/로켓 root가 없다.
- [ ] 부스터 불꽃이 일반 비행보다 2~2.5배 길고 뒤-아래 방향이다.
- [ ] 시작 시 5시 벽시계·알람·1.5초 인트로·1.5초 단기 부스트가 표시된다.
- [ ] `01-booster-reference.png`의 목표 패널과 비교한 스크린샷에서 수평으로 떠 있는 로켓이 보이지 않는다.

## Validation

- `git pull --ff-only origin main`
- `npm run validate:assets && npm run typecheck && npm run lint`
- `npm run test:run -- src/features/booster src/features/player src/features/start`
- `npm run test:e2e -- tests/e2e/booster.spec.ts tests/e2e/run.spec.ts --workers=1`

## Commit Message

```text
feat(booster): reinforce the attached bag jetpack with start intro

Plan: 2026-11-03-5pm-rush-game-feel
Phase: P04-booster-and-player-feel
Task: T07-attached-booster-and-start-intro

- Remove detached or baked booster flame presentation
- Add the five-o-clock alarm intro and short transition boost
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
