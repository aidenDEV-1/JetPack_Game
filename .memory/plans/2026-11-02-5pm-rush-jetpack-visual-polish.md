# Plan: 5PM RUSH Jetpack Joyride급 비주얼·애니메이션 고도화

## Goal

기존 React + Phaser 3 + TypeScript 게임 아키텍처와 Entra ID/Azure 기록 저장을 유지하면서, 현재 실행 화면의 캐릭터 사각형·중복 렌더링·잔상 문제를 제거하고 Jetpack Joyride급의 명확한 2D 아케이드 연출로 개선한다. 1280×720 mock 로그인 플레이 화면에서 캐릭터 얼굴과 밀짚모자는 현재 승인된 디자인을 유지하고, RUN/TAKEOFF/FLY/FALL/LAND/HIT/DEAD 애니메이션이 실제 상태에 맞게 전환되며, 가방형 제트팩·로켓 변환·불꽃·레이저·보안 장애물·HUD·수집/충돌 이펙트가 동일한 네이비/메탈/에너지 코어 아트 디렉션으로 보이게 한다.

완료 시 다음을 관찰할 수 있어야 한다.

- 캐릭터 프레임 외부는 알파 0이며 화면에 사각형 배경, debug rectangle, 중복 body sprite, 누적 trail/afterimage가 보이지 않는다.
- 지면에서는 RUN, 상승 시작에는 TAKEOFF, 공중 제트팩 사용 중에는 FLY, 제트팩 해제 하강에는 FALL, 착지 순간에는 LAND, 충돌 중에는 HIT, 충돌 종료 후에는 회색 DEAD가 표시된다. 비행 중 RUN 프레임을 재생하지 않는다.
- 가방·로켓 폼·불꽃·스파크가 `PlayerEntity`의 로컬 자식 계층에 붙어 함께 움직이며, 부스터 로켓이 캐릭터와 별도의 월드 오브젝트로 떠 있지 않다.
- 레이저는 금속 끝단 emitter, 얇은 밝은 코어, 제한된 글로우와 충전/활성 상태를 가진다. 표시 글로우는 충돌 판정에 포함되지 않고 실제 beam footprint와 충돌한다.
- 보라색 구형 몬스터 대신 회사 보안 시스템에 맞는 금속 보안 드론/전기 장애물/미사일/회전 장애물이 사용되며, 배경과 명확히 구분된다.
- HUD는 웹 대시보드가 아닌 짧고 선명한 아케이드 HUD로 보이고, 거리·코인·DEX 토큰·방어막·부스터 게이지·설정/일시정지를 한눈에 전달한다.
- 코인 획득, 착지, 달리기 먼지, 레이저 스파크, 드론 부유, 충돌 흔들림이 과도한 blur/trail 없이 표시되고 기존 이동·충돌·부스터·결과 저장·인증 흐름이 회귀하지 않는다.

## Scope and Constraints

- 기존 소스를 처음부터 다시 만들지 않는다. 현재 `RunScene`, `PlayerEntity`, `JetpackAttachment`, `ObstacleField`, `BackgroundController`, `GameHud`의 경계를 유지하고 필요한 심볼만 확장한다.
- 캐릭터 얼굴·안경·밀짚모자 인상은 현재 `player-spritesheet.png`의 승인된 디자인을 유지한다. 원본 얼굴 사진은 저장소에 추가하지 않고, 실행 단계에서 새 raster asset을 만들 때만 imagegen skill로 투명 PNG를 생성한다.
- Phaser 텍스처 자체는 사각형이므로 프레임 크기는 고정하되 캐릭터/장식 밖 픽셀은 알파 0으로 만든다. CSS의 투명 레이어나 Phaser `Graphics`로 플레이어 hitbox를 그리지 않는다.
- 현재 플레이어 스프라이트는 1536×1024, 384×170 프레임 24개이고 `BootScene`에서 5개 4-frame row와 fallen frame을 등록한다. 새 상태를 추가할 때는 동일한 384×170 셀을 유지하고 7개 상태 row(28 frames, 1536×1190)로 명시적으로 확장한다. 상태에 맞는 프레임이 없으면 다른 상태 프레임을 재사용하지 않고 에셋 검증을 실패시킨다.
- 현재 레이저의 `full/fixed/random` span, 1100m 이후 shield-gated `forced-crossfire`, 부스터 무적, 상단 경계 bounce, 하단 floor/run, 거리·코인 계산과 기록 저장 규칙을 변경하지 않는다.
- 제트팩 불꽃/입자와 HUD 아이콘은 콘텐츠별 파일로 분리한다. 매 frame `scene.add.*`로 잔상 객체를 무한 생성하지 않고 Phaser child/emitter를 재사용하거나 종료 시 destroy한다.
- 각 Task는 `git pull --ff-only origin main` 후 구현·검증·독립 commit·push를 수행하며, `.memory/current.md`를 다음 Task로 이동한다.

## Phases

| Phase | Status | Summary | Blueprint |
| :--- | :--- | :--- | :--- |
| P01 | `in_progress` | 플레이어 렌더링/애니메이션, 제트팩 VFX, 레이저·보안 장애물, 아케이드 HUD와 전체 연출을 기존 플레이 루프에 통합 | [P01](../phases/2026-11-02-5pm-rush-jetpack-visual-polish/P01-arcade-visual-polish/phase.md) |

## Execution Order

T01에서 캐릭터 투명 프레임·렌더 계층·검증 계약을 확정한다. T02가 상태별 플레이어 애니메이션을 연결한 뒤 T03에서 그 계층에 제트팩/로켓/불꽃을 결합한다. T04와 T05는 레이저와 보안 장애물을 같은 콘텐츠 계약으로 고도화하고, T06에서 React HUD를 아케이드 스타일로 정리한다. T07은 background parallax와 수집/착지/충돌 feedback을 연결하며, T08에서 mock 로그인 전체 플레이와 production guard를 검증한다. 앞 Task의 타입·asset contract를 뒤 Task가 재사용하므로 각 Task는 미완성 placeholder를 다음 Task에 넘기지 않는다.

## Non-Goals

- Entra ID 인증, Azure Functions/Cosmos 기록 API, 랭킹 데이터 모델을 재설계하지 않는다.
- 코인으로 로켓 외형을 구매하는 상점/구매 API는 구현하지 않는다. 기존 `BoosterStyleCatalog`의 향후 확장점은 유지한다.
- 모바일/터치 조작, 새로운 얼굴 사진 처리 파이프라인, 서버 authoritative 점수 검증은 이번 계획 범위가 아니다.
- 게임 물리 공식, 장애물의 shield 선행 조건, 부스터 지속시간/이동 거리 규칙을 비주얼 개선을 이유로 임의 변경하지 않는다.
