# 11. 기술 스택

## 목적과 관찰 결과

현재 운영 가능한 기술 스택과 외부 경계를 유지하면서 도메인별 코드를 추가한다.

## 현재 확정 규칙

- React 19: shell, HUD, settings, results, missions
- Phaser 3.90: game loop, rendering, input, collision geometry
- TypeScript 5.9 + Vite 7: build/type safety
- Vitest + Playwright: unit/E2E regression
- Azure Static Web Apps/Functions/Cosmos + Entra ID: auth, score, leaderboard

## 튜닝 파일

- `src/game/config/tuning/*.ts`
- `scripts/validate-assets.mjs`

## 담당 코드

- `src/services/auth`, `src/services/api`, `src/services/audio`, `src/game`, `src/features`

## 변경 시 검증

- `npm run validate:assets && npm run typecheck && npm run lint && npm run test:run && npm run build`
- `npm run test:e2e -- tests/e2e --workers=1`

## 참고 이미지

- 모든 `docs/reference/game-feel/*.png`는 구현·플레이테스트 비교 자료이며 runtime bundle에는 포함하지 않는다.
