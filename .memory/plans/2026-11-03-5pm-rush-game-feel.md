# Plan: 5PM RUSH 게임성 고도화

## Goal

기존 React 19 + Phaser 3 게임을 처음부터 다시 만들지 않고, 5시 정각 퇴근 탈출이라는 세계관과 현재 Entra ID·Azure 기록 연동을 유지하면서 반복 플레이가 가능한 아케이드 게임으로 고도화한다. 완료 시 첫 30초 안에 3종 이상의 장애물 패턴, 4개 이상의 코인 묶음, 경고 후 접근하는 미사일을 경험하고, 부스터·사운드·배경·보상·사망 연출이 서로 연결되어야 한다.

확정 결정: D-A 가방 제트팩 강화형, D-B 5시 벽시계 인트로 후 1.5초 짧은 부스트, D-C 스페이스바만, D-D hit-stop→2회 바운스→미끄러짐, D-E 비충돌 동료 NPC, D-F 런당 미션 3개와 결과 보너스, D-G 사무실 레이어부터 제작 후 확장.

## Phases

| Phase | Status | Summary | Blueprint |
| :--- | :--- | :--- | :--- |
| P01 | `done ✅` | 11개 영역의 설계 문서·튜닝 파일·중복 상수 정리 | [P01](../phases/2026-11-03-5pm-rush-game-feel/P01-foundation-and-tuning/phase.md) |
| P02 | `done ✅` | 연속 속도 곡선, 입력·물리 손맛, 사망 이동 연출 | [P02](../phases/2026-11-03-5pm-rush-game-feel/P02-movement-and-speed/phase.md) |
| P03 | `done ✅` | 거리 기반 장애물·코인 청크와 미사일 패턴 | [P03](../phases/2026-11-03-5pm-rush-game-feel/P03-obstacle-and-coin-chunks/phase.md) |
| P04 | `done ✅` | 가방 제트팩 강화형 부스터, 시작 인트로, 유예 무적 | [P04](../phases/2026-11-03-5pm-rush-game-feel/P04-booster-and-player-feel/phase.md) |
| P05 | `done ✅` | 사무실 우선 레이어 분리 배경과 나머지 구간 확장 | [P05](../phases/2026-11-03-5pm-rush-game-feel/P05-background-reconstruction/phase.md) |
| P06 | `done ✅` | 효과음·배경음 파이프라인과 비충돌 동료 NPC | [P06](../phases/2026-11-03-5pm-rush-game-feel/P06-audio-and-world-life/phase.md) |
| P07 | `done ✅` | 런당 미션 3개와 결과 보너스 코인 | [P07](../phases/2026-11-03-5pm-rush-game-feel/P07-reward-loop/phase.md) |
| P08 | `done ✅` | F 디버그 오버레이, 결정적 플레이테스트, 회귀 검증 | [P08](../phases/2026-11-03-5pm-rush-game-feel/P08-playtest-and-regression/phase.md) |

## Global Constraints

- 기존 인증, 랭킹, Cosmos 기록 API, React·Phaser 아키텍처를 유지한다. 원작의 고유명사·에셋·로고는 사용하지 않는다.
- 모든 게임 수치는 `src/game/config/tuning/`의 영역별 파일에서만 정의한다. Scene·Field에 새 숫자 리터럴을 추가하지 않는다.
- 새 raster 에셋은 투명 PNG로 만들고 `scripts/validate-assets.mjs`에 알파·프레임·여백 검사를 추가한다. 오디오 출처는 `public/assets/audio/CREDITS.md`에 기록한다.
- 각 Task는 `git pull --ff-only origin main`으로 시작하고, 관련 검증·스크린샷을 완료한 뒤 독립 커밋 및 `git push origin main`을 수행한다.
- 각 Task의 스크린샷은 `screenshots/<task-id>/`에 저장하며, 구현 전후의 참고 이미지와 비교 결과를 Task Progress에 기록한다.
