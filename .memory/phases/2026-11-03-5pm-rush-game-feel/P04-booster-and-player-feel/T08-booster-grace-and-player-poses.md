# Task: T08 부스터 유예 무적과 캐릭터 상태 포즈

## Status: done

## Goal

부스터 종료 후 1초 동안 깜빡이는 유예 무적을 제공하고, 부스터 중 화면 속도선과 -12도 전진 기울기를 보여준다. LANDING 스프라이트 크기 튐과 FALL의 엎드린 다이빙 포즈 문제를 해결한다.

## Decision Summary

- 부스터 무적과 방어막은 별도 상태다. 무적은 충돌을 무시하고, 방어막은 한 번의 충돌을 소비한다.
- 캐릭터 얼굴·안경·밀짚모자·갈색 가방은 유지하며 필요한 프레임만 새 투명 PNG로 재생성한다.

## Implementation

### I01. Booster grace state

- Related Files:
  - `src/features/booster/boosterTypes.ts` :: `BoosterState`, `BoosterFlightPhase`; modify
  - `src/features/booster/BoosterController.ts` :: `tick`, `isInvincible`; modify
  - `src/features/booster/BoosterFlightController.ts` :: snapshot phase; modify
  - `src/features/obstacles/CollisionResolver.ts` :: invincibility precedence; read-only/modify tests only
  - `src/game/scenes/RunScene.ts` :: booster transition; modify

#### Details

- 상태를 `idle | intro | boosting | grace | complete` 의미로 명확히 한다.
- 부스터 active 시간이 끝나면 `graceDurationMs=1000` 동안 `isInvincible()`가 true이고, `remainingMs`는 grace와 구분되는 field 또는 phase로 표시한다.
- grace 중 player는 `alpha` 또는 tint를 주기적으로 토글하지만 hitbox는 유지한다.
- token 3개 재발동, 시작 intro, 수동 테스트 API 모두 동일한 controller 경로를 사용한다.

### I02. Speed lines and pose assets

- Related Files:
  - `src/features/effects/SpeedLineEffect.ts` :: `start`, `update`, `stop`; new
  - `src/features/effects/RunEffects.ts` :: speed-line pool; modify
  - `src/features/player/PlayerEntity.ts` :: booster lean and state alignment; modify
  - `src/features/player/playerAssetConfig.ts` :: per-state frame metadata; modify
  - `public/assets/generated/player-spritesheet.png` and source asset script — LANDING/FALL frames; modify/new

#### Details

- speed lines는 플레이어 잔상이나 별도 player sprite가 아니라 bounded pooled Graphics/texture effect로 구현한다.
- booster active 동안만 보이고 종료 시 pool object를 숨겨 누적 잔상을 만들지 않는다.
- RUN/TAKEOFF/FLY/FALL/LANDING 프레임의 display size와 anchor를 동일한 `PLAYER_HEIGHT` 기준으로 보정한다.
- FALL은 현재 엎드린 DEAD와 혼동되지 않도록 얼굴 방향·팔·가방 실루엣이 보이는 별도 프레임을 사용한다.

### I03. Regression tests

- Related Files:
  - `src/features/booster/__tests__/BoosterController.test.ts` — grace 1초와 shield 독립성; modify
  - `src/features/booster/__tests__/BoosterFlightController.test.ts` — phase transitions; modify
  - `src/features/effects/RunEffects.test.ts` — speed-line pool bound; new
  - `tests/e2e/booster.spec.ts` — grace blink and no duplicate player; modify

## Acceptance Criteria

- [ ] 부스터 종료 직후 1초간 충돌이 무시되고 HUD/시각 효과에서 grace가 구분된다.
- [ ] 부스터 중 속도선이 bounded pool로 표시되며 종료 후 잔상이 남지 않는다.
- [ ] LANDING 크기 튐과 FALL/DEAD 포즈 혼동이 사라진다.
- [ ] `01-booster-reference.png` 목표의 불꽃·기울기·속도선과 비교 가능한 스크린샷이 생성된다.

## Validation

- `git pull --ff-only origin main`
- `npm run validate:assets && npm run typecheck && npm run lint`
- `npm run test:run -- src/features/booster src/features/player src/features/effects`
- `npm run test:e2e -- tests/e2e/booster.spec.ts --workers=1`

## Commit Message

```text
feat(booster): add grace invincibility and speed-line feedback

Plan: 2026-11-03-5pm-rush-game-feel
Phase: P04-booster-and-player-feel
Task: T08-booster-grace-and-player-poses

- Add one-second post-boost invincibility and bounded speed lines
- Normalize landing and falling player poses around the player height
```

## Progress

- [x] 구현 완료
- [x] 검증 통과
- commit: pending (현재 task 커밋에서 기록)
