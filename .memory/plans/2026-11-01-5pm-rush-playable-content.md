# Plan: 5PM RUSH 플레이어블 콘텐츠·연출 보강

## Goal

현재 게임의 도형/색상 placeholder와 미연결된 기능을 실제 플레이 가능한 콘텐츠로 교체한다. 인증 후 시작 버튼을 누르면 1280×720 게임 화면에서 다음이 동시에 관찰되어야 한다.

- 첨부 사진의 인상을 유지한 일러스트 캐릭터가 머리카락을 노출하지 않는 밀짚모자와 갈색 가죽가방형 제트팩을 착용한다.
- 0~5000m의 5개 구간이 실제 이미지 기반의 3중 패럴랙스 배경으로 끊김 없이 왼쪽으로 반복 이동한다. 2000~3000m는 도심 고층빌딩, 3000~4000m는 지하철 진입·내부·지상 탈출의 하위 장면으로 표현한다.
- 코인·방어막·DEX 토큰이 실제 생성되어 화면에 보이고, 이동/수집되며, HUD 수치가 즉시 갱신된다.
- 시작 직후와 토큰 3개 수집 시 부스터가 실제로 플레이어를 오른쪽 끝까지 운반한 뒤 원래 왼쪽 위치로 복귀시키고, 그동안 무적·고속·부스터 연출이 적용된다.
- 장애물이 생성·이동·충돌 판정되고, 방어막 선행 조건과 최소 1100m 조건이 지켜진다. 상단 경계는 충돌이 아니라 튕김, 하단 경계는 바닥 달리기로 유지한다.
- 충돌 후 결과 화면과 기록 저장 흐름이 실제 게임 종료 이벤트에 연결되어 기존 개인/조직 랭킹 기능이 회귀하지 않는다.

현재 코드 확인 결과, `BackgroundController`는 Rectangle만 만들고 `assetRegistry`는 비어 있으며, `ItemEntity`와 `ObstacleEntity`는 `RunScene`의 생성·이동·충돌 루프에 연결되어 있지 않다. `BoosterController`도 상태와 불꽃 표시만 바꾸고 실제 x축 비행을 수행하지 않는다. 이 계획은 이 원인을 기준으로 에셋 계층과 런타임 계층을 분리한다.

## Scope and Constraints

- Phaser 3 + TypeScript + React 구조와 현재 Azure/Entra 로그인 흐름을 유지한다.
- 콘텐츠별 파일 경계를 유지한다: 캐릭터, 제트팩/부스터, 아이템, 배경, 장애물, 게임 루프, 결과/기록은 각각 독립적으로 수정할 수 있어야 한다.
- 구현 중 각 Task마다 `git pull --ff-only origin main` 후 검증·commit·push를 수행한다. `.env.local`과 원본 얼굴 사진은 커밋하지 않는다.
- 사진의 얼굴 특징은 일러스트 에셋 생성 시에만 참고한다. 저장소에는 원본 사진이 아니라 생성된 게임용 일러스트만 둔다.
- 새 이미지 에셋을 만들 때는 실행 단계에서 `imagegen` skill을 먼저 읽고, 첨부 이미지를 참조로 사용한다. 기존 코드 도형을 조금 다듬는 방식으로 고품질 요구를 충족시키지 않는다.

## Phases

| Phase | Status | Summary | Blueprint |
| :--- | :--- | :--- | :--- |
| P01 | `done ✅` | 실제 일러스트·아이템·배경 에셋과 Phaser 로딩/렌더링 기반 구축 | [P01](../phases/2026-11-01-5pm-rush-playable-content/P01-visual-asset-foundation/phase.md) |
| P02 | `done ✅` | 아이템·장애물·부스터를 RunScene의 실제 플레이 루프에 연결 | [P02](../phases/2026-11-01-5pm-rush-playable-content/P02-playable-world-loop/phase.md) |
| P03 | `in_progress` | 충돌 결과·기록 저장·HUD 연결 및 회귀 검증 | [P03](../phases/2026-11-01-5pm-rush-playable-content/P03-results-and-regression/phase.md) |

## Execution Order

P01의 에셋 키와 로딩 계약을 먼저 확정한 뒤 P02에서 런타임을 연결한다. P03은 P02의 `RunScene` 종료 이벤트가 있어야 결과/기록을 실제로 검증할 수 있으므로 마지막에 수행한다. 각 Task는 하나의 독립 commit으로 끝내며, Task 사이의 미완성 연결을 다음 Task가 추측하지 않도록 청사진에 public API와 상태 전이를 명시한다.

