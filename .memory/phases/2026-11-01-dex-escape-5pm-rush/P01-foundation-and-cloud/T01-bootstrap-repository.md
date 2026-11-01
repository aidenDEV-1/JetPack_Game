# Task: T01 Bootstrap Repository

## Status: done

## Goal
빈 GitHub 저장소를 실행 가능한 React + Phaser 3 + TypeScript 웹 앱으로 초기화하고, 이후 Task가 동일한 명령으로 개발·검증·커밋·푸시될 수 있는 기반을 만든다.

## Decision Summary
- Vite 기반 React 앱, Phaser 3, TypeScript strict 모드, Vitest를 사용한다.
- 저장소 원격은 `https://github.com/aidenDEV-1/JetPack_Game.git`, 기본 브랜치는 `main`이다.

## Implementation

### I01. Repository and toolchain
- Related Files:
  - `package.json` — scripts와 런타임 의존성; new
  - `tsconfig.json`, `tsconfig.node.json` — strict TypeScript 설정; new
  - `vite.config.ts` — Vite와 Vitest 설정; new
  - `index.html` — 한국어 게임 진입 문서; new
  - `.gitignore`, `.env.example` — 생성물·비밀값 제외; new

#### Details
- **Dependencies**: `react`, `react-dom`, `phaser`; dev dependencies `typescript`, `vite`, `@vitejs/plugin-react`, `vitest`, `@types/react`, `@types/react-dom`, `eslint`.
- **Scripts**: `dev`, `build`, `preview`, `test`, `test:run`, `lint`, `typecheck`를 제공한다.
- **Environment fields**: `VITE_API_BASE_URL`, `VITE_AZURE_STATIC_WEB_APP_URL`, `VITE_ASSET_VERSION`; 비밀키는 Vite 환경변수로 넣지 않는다.
- **Git flow**: 원격이 빈 저장소이면 `git init -b main`, `git remote add origin ...`, 초기 commit 후 `git push -u origin main`; 이후 Task는 `git pull --ff-only origin main`을 먼저 실행한다.

### I02. Source architecture
- Related Files:
  - `src/app/App.tsx` — 로그인/게임/결과 화면 루트; new
  - `src/game/` — Phaser 장면과 게임 시스템; new
  - `src/features/` — player, items, obstacles, background, records 기능별 모듈; new
  - `src/content/` — 에셋 키·배경 구간·게임 밸런스 설정; new
  - `src/services/` — Azure 인증·API 클라이언트; new
  - `src/styles/` — 16:9 UI 토큰과 화면 스타일; new

#### Details
- Phaser 로직은 React 상태와 직접 섞지 않고 `GameBridge`를 통해 이벤트를 전달한다.
- 11개 기능 요소는 기능 폴더와 설정 파일을 분리한다. 콘텐츠 추가는 `src/content`와 해당 feature 폴더만 수정하도록 한다.
- 초기 단계에는 실제 이미지가 없어도 앱이 로드되도록 에셋 키와 placeholder 로더를 둔다.

## Acceptance Criteria
- [ ] `npm install`과 `npm run dev`가 성공한다.
- [ ] `npm run build`, `npm run typecheck`, `npm run test:run`이 성공한다.
- [ ] 브라우저에 16:9 게임 셸과 한국어 로딩 화면이 표시된다.
- [ ] 원격 `main`에 Task 커밋이 push된다.

## Validation
- `npm install && npm run typecheck && npm run test:run && npm run build` — 모두 exit code 0.
- `git diff --check` — 공백 오류 없음.

## Commit Message
```text
chore(bootstrap): initialize React Phaser TypeScript app

Plan: 2026-11-01-dex-escape-5pm-rush
Phase: P01-foundation-and-cloud
Task: T01-bootstrap-repository

- initialize Vite React Phaser workspace
- add feature-oriented source structure and validation scripts
```

## Progress
- [x] 구현 완료
- [x] 검증 통과
- commit: pending
