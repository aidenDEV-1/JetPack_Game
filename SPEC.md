# 5PM RUSH 게임 설계 목차와 불변 제약

## 설계 문서

게임 영역별 규칙·튜닝·담당 코드·검증 명령은 아래 문서가 단일 문서 출처다.

1. [게임 컨셉](docs/game-design/01-concept.md)
2. [캐릭터](docs/game-design/02-character.md)
3. [제트팩](docs/game-design/03-jetpack.md)
4. [아이템](docs/game-design/04-items.md)
5. [배경](docs/game-design/05-background.md)
6. [최대 높이](docs/game-design/06-height.md)
7. [이동 속도](docs/game-design/07-speed.md)
8. [부스터](docs/game-design/08-booster.md)
9. [장애물](docs/game-design/09-obstacles.md)
10. [게임 방식](docs/game-design/10-gameplay.md)
11. [기술 스택](docs/game-design/11-tech-stack.md)

## 확정 플레이 결정

- D-A: 기존 갈색 가방이 강화되는 제트팩 부스터. 별도 탈것 교체 없음.
- D-B: 5시 벽시계와 알람, 1.5초 인트로, 1.5초 짧은 부스트 후 일반 비행.
- D-C: 스페이스바 홀드만 사용.
- D-D: 80ms hit-stop, 바닥 2회 바운스, 감속 미끄러짐 후 결과 화면. 미끄러진 거리 포함.
- D-E: 퇴근 동료 NPC를 배경 장식으로 추가하되 충돌 판정 없음.
- D-F: 런당 미션 3개와 결과 보너스 코인. 기존 서버 저장 스키마 유지.
- D-G: 사무실 L0~L3 레이어를 먼저 검증하고 나머지 구간에 확장.

## 공통 수치·구현 제약

- 모든 변경 가능한 수치는 `src/game/config/tuning/`의 영역별 파일에서 관리한다. Scene/Field에 새 매직 넘버를 추가하지 않는다.
- 현재 논리 viewport는 `1280×720`, 플레이어 높이 기준은 `PLAYER_HEIGHT=96px`이다.
- 장애물 통과 간격은 플레이어 높이의 `1.6H` 이상이며, 강제 패턴은 1100m·방어막 선행 조건을 지킨다.
- 기존 React 19 + Phaser 3.90 + TypeScript + Vite + Vitest + Playwright 구조를 유지한다.
- Entra ID 인증, Azure Functions/Cosmos 기록 API, 랭킹 DTO와 저장 흐름을 변경하지 않는다.
- 원작 Jetpack Joyride의 고유명사·캐릭터·로고·에셋을 사용하지 않는다.
- 새 raster 에셋은 투명 PNG로 만들고 `scripts/validate-assets.mjs`에서 크기·알파·프레임·여백을 검사한다.
- 효과음/배경음은 라이선스가 명확한 파일 또는 WebAudio 합성음을 사용하고 `public/assets/audio/CREDITS.md`에 출처를 기록한다.

## 참고 이미지

- `docs/reference/game-feel/01-booster-reference.png`
- `docs/reference/game-feel/02-obstacle-chunks.png`
- `docs/reference/game-feel/03-speed-curve.png`
- `docs/reference/game-feel/04-background-layers.png`

참고 이미지는 문서·Playwright 시각 비교용이며 게임 runtime asset으로 import하지 않는다.

## Non-Goals

- 코인 상점·구매 API
- 서버 측 점수 검증
- 모바일 터치 전용 UI
- 인증·랭킹 구조 변경

## 5PM RUSH 게임성 고도화 완료 상태

- P01~P08의 T01~T16 구현·검증을 완료했다.
- 일반 비행, 가방 일체형 부스터, 레이저/미사일/드론 장애물, 코인·토큰·방어막, 비충돌 동료 NPC, 런당 미션과 결과 보너스를 유지보수 가능한 영역별 코드로 분리했다.
- 거리 구간 시각 회귀 캡처: [screenshots/T16/metadata.json](screenshots/T16/metadata.json)
- 개발 전용 디버그 캡처: [screenshots/T15/debug-metrics.png](screenshots/T15/debug-metrics.png)
- 결과 미션 캡처: [screenshots/T14/mission-result.png](screenshots/T14/mission-result.png)
- 최종 검증 명령은 `README.md`의 품질 검증 절차를 따른다.
