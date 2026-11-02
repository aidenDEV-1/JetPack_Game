# Task: T01 참고 자료와 게임 설계 문서 체계 구축

## Status: pending

## Goal

저장소에 `game-feel-kit.zip`의 4개 참고 이미지를 표준 경로로 추가하고, 11개 게임 영역을 각각 독립적으로 수정할 수 있는 설계 문서와 `SPEC.md` 목차를 만든다. 이후 구현자가 이미지·문서·담당 코드를 다시 찾지 않아도 각 영역의 규칙과 검증 명령을 알 수 있어야 한다.

## Decision Summary

- 첨부 자료의 구현 지시는 계획의 요구사항으로 반영하되, 실제 코드는 이 Task에서 수정하지 않는다.
- 원작 고유명사와 에셋은 사용하지 않고 사무실·퇴근·DEX 세계관만 사용한다.

## Implementation

### I01. 참고 이미지와 에셋 계약

- Related Files:
  - `game-feel-kit.zip` — 입력 자료; read-only
  - `docs/reference/game-feel/01-booster-reference.png` — 부스터 연출 기준; new
  - `docs/reference/game-feel/02-obstacle-chunks.png` — 청크 패턴 기준; new
  - `docs/reference/game-feel/03-speed-curve.png` — 속도 곡선 기준; new
  - `docs/reference/game-feel/04-background-layers.png` — 배경 레이어 기준; new
  - `scripts/validate-assets.mjs` :: `requiredFiles` — 참고 이미지 존재 검사; modify

#### Details

- `game-feel-kit.zip`에서 `docs/reference/game-feel/*.png`만 추출한다. `MEMORY_PLAN_PROMPT.md`는 저장소의 계획 문서와 중복되므로 runtime asset으로 복사하지 않는다.
- 네 파일의 실제 PNG, 알파, 가로·세로 크기를 검사하고 원본 압축 파일은 덮어쓰지 않는다.
- `validate-assets.mjs`에 참고 이미지 4개를 필수 파일로 등록한다. 누락 시 명확한 파일 경로를 출력하고 실패해야 한다.
- 에셋은 게임 번들에 import하지 않는다. 문서와 Playwright 비교용 파일로만 사용한다.

### I02. 11개 설계 문서와 SPEC 목차

- Related Files:
  - `docs/game-design/01-concept.md` ~ `11-tech-stack.md` — 각 게임 영역의 규칙·튜닝 파일·담당 코드·테스트; new
  - `SPEC.md` — 설계 문서 목차와 불변 제약; modify

#### Details

각 문서는 다음 고정 섹션을 가진다.

1. 목적과 플레이어가 관찰할 결과
2. 현재 확정 규칙
3. 담당 튜닝 파일 링크
4. 담당 코드 폴더·주요 심볼
5. 변경 시 실행할 단위/E2E 명령
6. 참고 이미지와 비교 포인트

11개 영역의 문서 매핑은 다음과 같다.

| 문서 | 핵심 내용 | 담당 코드 |
| :--- | :--- | :--- |
| `01-concept.md` | 5시 정각 퇴근 탈출, 거리·코인·랭킹 목표 | `src/game/scenes`, `src/content/copy.ko.ts` |
| `02-character.md` | 얼굴·안경·밀짚모자·상태 애니메이션 | `src/features/player`, `src/content/assets/player*` |
| `03-jetpack.md` | 갈색 가방과 노즐 앵커, 교체 가능한 스타일 | `src/features/player`, `src/features/booster` |
| `04-items.md` | 코인·방어막·DEX 토큰과 패턴 | `src/features/items` |
| `05-background.md` | L0~L3 레이어, 1000m 구간과 타일 반복 | `src/features/background`, `src/content/background*` |
| `06-height.md` | `floorY`, `ceilingY`, 반동·바닥 규칙 | `src/game/config/tuning/movement.ts` |
| `07-speed.md` | 거리 기반 연속 속도 곡선 | `src/game/config/tuning/speed.ts`, `src/features/progression` |
| `08-booster.md` | 시작 인트로, 토큰 3개, 유예 무적 | `src/features/booster`, `src/features/start` |
| `09-obstacles.md` | 청크·레이저·미사일·통과 가능성 | `src/features/obstacles` |
| `10-gameplay.md` | update 흐름·충돌·보상·사망 상태 | `src/game/scenes`, `src/game/state` |
| `11-tech-stack.md` | React 19, Phaser 3.90, TypeScript, Vite, Azure | 프로젝트 설정과 `src/services` |

`SPEC.md`는 새 문서를 나열하고, 확정된 부스터·입력·사망·NPC·미션·배경 결정을 요약한다. 수치의 원본은 SPEC가 아니라 P01-T02 튜닝 파일이어야 한다.

### I03. 문서 검증

- Related Files:
  - `tests/e2e/production-guard.spec.ts` — production bundle에 문서/개발 hook 누출 여부 확인; read-only 또는 modify if needed

#### Details

- 문서 링크가 모두 실제 파일을 가리키는지 검사한다.
- 참고 이미지가 `validate:assets` 대상인지 확인한다.
- 코드 변경이 없으므로 기존 단위/E2E 테스트의 수치 기대값은 변경하지 않는다.

## Acceptance Criteria

- [ ] 참고 PNG 4개가 `docs/reference/game-feel/`에 있고 원본 압축 파일은 변경되지 않는다.
- [ ] 11개 설계 문서가 동일한 섹션 구조와 실제 코드·튜닝 링크를 가진다.
- [ ] `SPEC.md`가 11개 문서의 목차이며 결정사항과 Non-Goals를 포함한다.
- [ ] `npm run validate:assets`가 참고 이미지 누락을 감지하고 현재 파일셋에서는 성공한다.

## Validation

- `git pull --ff-only origin main` — 최신 main 동기화
- `npm run validate:assets` — 필수 게임 에셋과 참고 이미지 검증 성공
- `npm run typecheck && npm run lint && npm run test:run` — 문서 작업으로 기존 동작이 깨지지 않음

## Commit Message

```text
docs(game-design): add game-feel reference and domain specifications

Plan: 2026-11-03-5pm-rush-game-feel
Phase: P01-foundation-and-tuning
Task: T01-reference-and-design-docs

- Add four visual reference assets and validation contracts
- Split the game rules into eleven maintainable design documents
```

## Progress

- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
