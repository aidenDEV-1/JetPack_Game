# Plan: 5PM RUSH 장애물 플레이성 및 반응형 게임 화면 개선

## Goal

수직·수평 레이저의 실제 빔 길이를 플레이 가능한 범위로 줄이고, 방어막이 있어야만 통과할 수 있는 강제 즉사 패턴을 제거하며, 오른쪽에서 진입하는 미사일 장애물을 일반 청크 전반에 더 자주 배치한다. 동시에 논리 게임 해상도는 기존 `1280×720`을 유지하되 브라우저의 가용 너비에 맞춰 게임 프레임과 Phaser 캔버스가 함께 확대되도록 수정한다.

완료 후에는 레이저와 노드 사이의 회피 공간이 항상 남고, 미사일 경고가 오른쪽 끝에서 반복적으로 나타나며, 1280px보다 넓은 브라우저에서도 게임 화면이 고정 1280px로 남지 않아야 한다.

## Constraints

- React 19 + Phaser 3.90 + TypeScript + Vite 구조와 기존 Entra ID/기록 저장 흐름은 변경하지 않는다.
- Phaser의 논리 viewport `1280×720`, `PLAYER_HEIGHT=96px`, 플레이어 조작·충돌·방어막 소비 동작은 유지한다.
- 레이저 길이·장애물 배치 수치에는 Scene의 새 매직 넘버를 추가하지 않고 `src/game/config/tuning/` 또는 청크 카탈로그에서 관리한다.
- 방어막 아이템 자체는 유지하지만, 방어막을 미리 먹어야만 생존 가능한 장애물 패턴은 더 이상 제공하지 않는다.
- `Phaser.Scale.FIT`를 유지해 넓은 CSS 영역에 논리 viewport를 비율 유지로 확대한다. `RESIZE` 모드로 바꾸어 모든 월드 좌표를 재설계하지 않는다.
- 참고 이미지나 원작 고유 에셋을 runtime에 추가하지 않는다.

## Phases

| Phase | Status | Summary | Blueprint |
| :--- | :--- | :--- | :--- |
| P01 | `in_progress` | 레이저를 플레이 가능한 길이로 축소하고 강제 즉사 패턴을 제거한 뒤, 미사일 빈도와 반응형 게임 프레임을 검증 | [P01](../phases/2026-11-06-obstacle-playability-responsive/P01-obstacle-playability-responsive/phase.md) |

## Definition of Done

- 모든 runtime 레이저가 `144px~192px` 범위의 고정/무작위 길이만 사용하며 화면 전체를 가로지르는 `full` 레이저가 없다.
- `forced-crossfire`와 방어막 선행 강제 청크가 삭제되어, 방어막이 없어도 정상 패턴으로 생존 경로가 존재한다.
- 표준 거리 청크 A~E 각각에 경고가 있는 미사일이 최소 한 개 이상 있어 기존보다 오른쪽 진입 장애물 빈도가 증가한다.
- 브라우저 viewport를 넓히면 `.game-frame`과 Phaser canvas의 CSS 너비가 함께 증가하고 16:9 비율을 유지한다.
- `SPEC.md` 및 장애물 설계 문서가 실제 구현 규칙과 일치한다.
- 단위 테스트, Playwright 회귀 테스트, typecheck, lint, build가 통과한다.
