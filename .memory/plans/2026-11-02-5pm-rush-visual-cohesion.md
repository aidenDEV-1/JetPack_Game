# Plan: 5PM RUSH 캐릭터·부스터·장애물 시각 일체감 개선

## Goal

현재 승인된 캐릭터 일러스트를 유지하면서, 제트팩을 별도 오브젝트가 아닌 캐릭터가 멘 갈색 가죽가방에서 불꽃이 나오는 개조 가방으로 보이게 만든다. 캐릭터 주변의 네모난 시각 영역과 부스터 잔상을 제거하고, 장애물은 배경과 명확히 대비되며 우측 끝의 깜빡이는 위험 표시로 미리 인지할 수 있게 한다.

완료 시 1280×720 플레이 화면에서 다음을 관찰할 수 있어야 한다.

- 캐릭터·가죽가방·불꽃이 하나의 `PlayerEntity` 계층 안에서 붙어 움직이고, 불꽃의 시작점이 가방 배출구에 고정된다.
- 캐릭터 주변에 정사각형 aura/trail 또는 독립된 제트팩 오브젝트가 보이지 않고, 충돌 영역도 캐릭터 몸체 크기만 사용한다.
- 부스터 중에는 가방 배출구의 불꽃만 표시되며 이전 프레임의 잔상, 누적 trail sprite, 프레임마다 생성되는 임시 오브젝트가 남지 않는다.
- 레이저·미사일·몬스터의 시각 크기와 색 대비가 증가하고, 경고 대상은 장애물이 우측 화면 밖에서 접근하는 동안 화면 우측 가장자리에서 깜빡이는 `← 위험` 표시를 보여준다.
- 기존 이동·부스터 무적·충돌·방어막 선행 조건·결과 저장 동작은 변경되지 않는다.

## Scope and Constraints

- Phaser 3 + TypeScript + React 구조와 현재 Entra/mock 로그인, 기록 저장 API 계약은 유지한다.
- 캐릭터 얼굴 일러스트와 밀짚모자 디자인은 승인된 에셋을 그대로 사용한다. 새 얼굴 재생성은 하지 않고, 필요한 경우 가방 배출구 anchor와 VFX 배치만 수정한다.
- 콘텐츠 경계를 유지한다: 플레이어/제트팩은 `src/features/player/`와 `src/features/booster/`, 장애물과 경고는 `src/features/obstacles/`, 검증은 `tests/`에서 관리한다.
- 시각 크기를 키울 때 충돌 판정이 갑자기 불공정해지지 않도록 화면 표시 크기와 collision footprint를 별도 필드로 관리하고, 기존 랜덤 spawn·1100m shield-gated forced pattern 규칙은 유지한다.
- 각 Task는 `git pull --ff-only origin main` 후 구현·검증·commit·push하고, `.memory/current.md`를 다음 Task로 이동한다.

## Phases

| Phase | Status | Summary | Blueprint |
| :--- | :--- | :--- | :--- |
| P01 | `done ✅` | 캐릭터-제트팩 결합, 부스터 잔상 제거, 장애물 가독성·우측 경고·시각 회귀 검증 | [P01](../phases/2026-11-02-5pm-rush-visual-cohesion/P01-visual-cohesion-and-hazard-clarity/phase.md) |

## Execution Order

T01에서 캐릭터 계층과 가방 배출구 anchor를 먼저 확정한다. T02는 그 계층을 사용해 부스터의 불꽃만 남기고 잔상 생성 경로를 제거한다. T03은 장애물 표시 모델과 우측 경고 indicator를 연결한다. T04에서 mock 로그인 전체 플레이, 충돌/경고, 에셋 404·콘솔 오류·production build 회귀를 함께 검증한다.
