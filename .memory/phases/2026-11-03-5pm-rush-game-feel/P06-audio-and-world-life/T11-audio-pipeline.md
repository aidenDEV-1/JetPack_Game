# Task: T11 효과음·배경음 파이프라인

## Status: pending

## Goal

현재 존재하지 않는 `/assets/audio/5pm-rush-loop.mp3` 의존성을 해결하고, 부스터·코인·레이저·미사일·충돌·결과에 효과음을 연결한다. 로그인 후 자동 재생, 설정의 음소거, 브라우저 autoplay 실패를 안전하게 처리한다.

## Decision Summary

- 무료 라이선스 음원 또는 WebAudio 합성음을 사용하고 출처를 `public/assets/audio/CREDITS.md`에 남긴다.
- 효과음은 별도 `AudioController` API로 관리하며 Phaser Scene에 직접 `new Audio()`를 흩뿌리지 않는다.

## Implementation

### I01. Audio assets and controller

- Related Files:
  - `public/assets/audio/5pm-rush-loop.mp3` — 배경음; new or licensed replacement
  - `public/assets/audio/*.wav` — 효과음; new
  - `public/assets/audio/CREDITS.md` — license/source; new
  - `src/services/audio/AudioController.ts` :: `playMusic`, `playSfx`, `toggleMute`; modify
  - `src/game/config/tuning/audio.ts` :: `AUDIO_TUNING`; modify
  - `scripts/validate-assets.mjs` — audio required files; modify

#### Details

```typescript
export type SfxId = 'alarm' | 'booster-start' | 'booster-end' | 'coin' | 'laser-warning' | 'missile-launch' | 'shield-hit' | 'crash' | 'result';

public playMusic(): Promise<boolean>;
public playSfx(id: SfxId, options?: { rate?: number; volume?: number }): boolean;
public setMuted(muted: boolean): void;
```

- `playMusic`는 기존 로그인/게임 shell callback에서 계속 호출한다.
- AudioContext가 suspended면 첫 사용자 start action에서 resume한다.
- 음소거는 music과 active SFX gain 모두에 적용하고, 음소거 상태는 페이지 수명 동안 일관된다.
- coin 연속 획득은 `rate`/pitch를 1~5 step으로 제한해 과도한 고음이 되지 않게 한다.

### I02. Event wiring

- Related Files:
  - `src/app/GameShell.tsx` :: `startGame`, mute state; modify
  - `src/game/scenes/RunScene.ts` :: item/booster/crash events; modify
  - `src/features/obstacles/ObstacleWarningIndicator.ts` :: warning event; modify
  - `src/features/effects/RunEffects.ts` :: visual/audio event boundary; modify
  - `src/features/results/ResultsPanel.tsx` :: result sound trigger boundary; modify if needed

#### Details

- `onAlarm` → `alarm`, booster activate → `booster-start`, end/grace → `booster-end`, coin → `coin`, warning/launch → corresponding SFX, shield block → `shield-hit`, crash/result → `crash`/`result`.
- 시각 효과 object pool과 오디오 호출을 1:1로 결합하지 말고, gameplay event에서 한 번만 호출한다.
- 같은 frame에서 coin 여러 개가 수집되어도 audio 호출 상한을 둔다.

## Acceptance Criteria

- [ ] 404 없이 배경음 파일이 로드된다.
- [ ] 시작 알람·부스터·코인·장애물·충돌·결과에 효과음이 난다.
- [ ] 설정 음소거가 music/SFX 모두에 적용된다.
- [ ] autoplay 거부·AudioContext 오류가 게임을 중단시키지 않는다.
- [ ] 오디오 출처·라이선스 문서가 존재한다.

## Validation

- `git pull --ff-only origin main`
- `npm run validate:assets && npm run typecheck && npm run lint`
- `npm run test:run -- src/services/audio src/features/settings src/features/start`
- `npm run test:e2e -- tests/e2e/playable-run.spec.ts tests/e2e/production-guard.spec.ts --workers=1`
- 브라우저 Network에서 `/assets/audio/*` 404가 없는지 확인

## Commit Message

```text
feat(audio): add licensed music and gameplay sound effects

Plan: 2026-11-03-5pm-rush-game-feel
Phase: P06-audio-and-world-life
Task: T11-audio-pipeline

- Add a centralized music and SFX controller with mute support
- Wire audio cues to alarms, pickups, hazards, boosters, and crashes
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
