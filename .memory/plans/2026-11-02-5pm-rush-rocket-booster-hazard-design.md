# Plan: 5PM RUSH 로켓형 부스터·레이저 장애물 디자인 고도화

## Goal

현재 캐릭터의 얼굴·밀짚모자·가방 일러스트를 유지하면서, 부스터 작동 시 캐릭터와 분리되어 떠 있는 로켓 이미지를 제거하고 가방 자체가 로켓형 부스터로 변환되는 하나의 시각 계층을 만든다. 향후 코인으로 로켓 외형을 구매·교체할 수 있도록 스타일 카탈로그와 가격 메타데이터를 분리하고, 현재는 기본 로켓 스타일만 활성화한다.

동시에 수직·수평 레이저와 기존 장애물의 시각 품질을 고도화한다. 레이저는 화면 끝까지 뻗는 형태와 특정 길이의 형태를 패턴 설정으로 선택할 수 있고, 실제 충돌 범위와 발광·외곽 장식은 분리한다. 1280×720 플레이 화면에서 다음 결과를 관찰할 수 있어야 한다.

- 평상시에는 갈색 가죽가방이 보이고, 부스터 중에는 같은 가방 위치에서 로켓형 부스터 폼으로 자연스럽게 변환된다.
- 로켓 폼·불꽃·무적 효과는 모두 `PlayerEntity`의 로컬 자식 계층에 포함되며, 캐릭터와 별도로 둥둥 떠 있거나 월드에 잔류하지 않는다.
- 기본 로켓 스타일을 나중에 코인 상점에서 다른 스타일로 교체할 수 있도록 `styleId`, 에셋 key, 가격 메타데이터가 콘텐츠 카탈로그로 분리된다. 이번 계획에서는 구매·서버 저장 UI를 구현하지 않는다.
- 수직·수평 레이저는 밝은 코어, 컬러 글로우, 끝단 emitter로 구성되고, `full-span` 또는 `fixed/random-span` 길이가 실제 패턴 데이터와 화면에 일치한다.
- 레이저의 글로우·warning panel·외곽 장식은 충돌 대상이 아니며, collision footprint는 실제 빔과 패턴 규칙만 사용한다.
- 기존 Entra/mock 로그인, 토큰 3개 부스터, 부스터 무적, 방어막 선행 강제 패턴, 결과 저장·랭킹 흐름은 변경되지 않는다.

## Scope and Constraints

- Phaser 3 + TypeScript + React 구조와 기존 `PlayerEntity`, `BoosterController`, `BoosterFlightController`, `ObstacleField` 이벤트 계약을 유지한다.
- 원본 얼굴 사진은 추가하거나 커밋하지 않는다. 최종 게임용 투명 PNG 에셋만 `public/assets/`에 둔다.
- Phaser 텍스처는 내부적으로 사각형이므로, 캐릭터·로켓·레이저 emitter 외부는 알파 0인 투명 픽셀로 제작한다. 프레임 바깥에 반투명 사각형 후광을 남기지 않는다.
- 부스터 로켓은 독립적인 `scene.add.sprite()` 월드 오브젝트로 만들지 않는다. `PlayerEntity`에 붙은 `JetpackAttachment` 또는 그 내부 전용 child만 사용하고, `PlayerEntity.x/y/angle/scale`을 자동으로 따라가게 한다.
- `ObstaclePattern`의 충돌 크기와 표시 크기를 분리한다. 표시용 glow·outline·warning은 `getCollisionBoundsList()`에 추가하지 않는다.
- 레이저 길이는 spawn 시 한 번 결정해 한 run 동안 고정한다. 매 frame 랜덤 재계산으로 레이저가 깜빡이거나 충돌 범위가 변하지 않게 한다.
- 기존 1100m 이후 shield-gated forced-crossfire, segment당 1회 규칙과 플레이 가능한 gap 검증을 유지한다.
- 각 Task는 `git pull --ff-only origin main` 후 구현·검증·commit·push하고, `.memory/current.md`를 다음 Task로 이동한다.

## Phases

| Phase | Status | Summary | Blueprint |
| :--- | :--- | :--- | :--- |
| P01 | `in_progress` | 캐릭터 투명 프레임·가방 로켓 변환, 스타일 확장점, 레이저/장애물 시각 고도화 및 회귀 검증 | [P01](../phases/2026-11-02-5pm-rush-rocket-booster-hazard-design/P01-rocket-booster-and-laser-redesign/phase.md) |

## Execution Order

T01에서 투명 프레임과 향후 교체 가능한 로켓 스타일 계약·에셋을 먼저 확정한다. T02는 해당 스타일을 `PlayerEntity` 내부 가방 변환 계층에 연결하고 부스터 시작·종료·충돌 reset을 검증한다. T03은 레이저 span 모델과 고대비 hazard 렌더러를 연결하되 충돌 규칙을 보존한다. T04는 실제 1280×720 플레이 화면에서 부스터·레이저·경고·충돌·기존 플레이 루프를 함께 검증하고 청사진 문서를 갱신한다.

## Non-Goals

- 이번 계획에서 코인으로 로켓을 구매하는 상점 화면, 구매 API, Cosmos 저장 스키마를 구현하지 않는다. 대신 이후 Task가 사용할 `BoosterStyleCatalog`와 `coinPrice` 메타데이터만 만든다.
- 새로운 얼굴 디자인이나 원본 사진 처리 파이프라인을 추가하지 않는다.
- 레이저가 등장하는 빈도, 속도 증가 공식, 방어막·부스터의 게임 규칙 자체를 변경하지 않는다.
