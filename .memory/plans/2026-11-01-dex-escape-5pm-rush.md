# Plan: 덱스 탈출 넘버원 5PM RUSH

## Goal

빈 GitHub 저장소 `aidenDEV-1/JetPack_Game`에 React + Phaser 3 + TypeScript 기반의 PC 웹 게임을 구현한다. 회사 Microsoft Entra ID로 인증한 조직원만 플레이할 수 있고, Azure Static Web Apps·Azure Functions·Azure Cosmos DB를 사용해 최고 거리와 누적 코인을 저장한다. 캐릭터, 제트팩, 아이템, 배경, 높이 경계, 속도, 부스터, 장애물, 게임 방식, 기술 인프라를 서로 독립적인 모듈과 데이터 설정으로 관리해 콘텐츠별 수정·추가가 가능해야 한다.

## Git Workflow

- Remote: `https://github.com/aidenDEV-1/JetPack_Game.git`
- 기본 브랜치: `main`
- 각 Task 시작 전: `git pull --ff-only origin main` (원격에 커밋이 존재하는 경우)
- 각 Task 완료 후: 검증 통과 → 해당 Task 범위만 commit → `git push origin main`
- 커밋 전 `git status`, `git diff --check`, 테스트 결과를 확인한다.
- 현재 원격 저장소는 빈 저장소이므로 T01에서 초기 브랜치·원격 연결·프로젝트 구조를 만든다.

## Phases

| Phase | Status | Summary | Blueprint |
| :--- | :--- | :--- | :--- |
| P01 | `in_progress` | 프로젝트 기반, Entra 인증, Azure 데이터 계약과 저장 API | [P01](../phases/2026-11-01-dex-escape-5pm-rush/P01-foundation-and-cloud/phase.md) |
| P02 | `pending` | Phaser 게임 루프, 이동, 아이템, 부스터, 장애물, 배경 진행 | [P02](../phases/2026-11-01-dex-escape-5pm-rush/P02-gameplay-core/phase.md) |
| P03 | `pending` | 고품질 한국어 UI, 캐릭터·에셋 분리, 결과·랭킹·오디오 연출 | [P03](../phases/2026-11-01-dex-escape-5pm-rush/P03-content-and-ui/phase.md) |
| P04 | `pending` | Azure 배포, CI/CD, 통합 검증, 운영 문서 | [P04](../phases/2026-11-01-dex-escape-5pm-rush/P04-release-and-validation/phase.md) |

## Non-goals for Initial Release

- 모바일·터치 조작
- Firebase 사용
- 상점·스킨 구매 화면
- 공식 부정행위 방지 및 서버 authoritative 점수 계산
- 시즌 랭킹·전체 플레이 이력
- Firefox·Safari 지원
