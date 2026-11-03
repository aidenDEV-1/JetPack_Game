# 5PM RUSH

React + Phaser 3 + TypeScript로 만든 `덱스 탈출 넘버원 : 5PM RUSH` 아케이드 게임입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

개발 환경에서는 로그인 화면의 `개발용 mock 로그인`으로 게임 루프를 확인할 수 있습니다. 실제 배포에서는 Entra ID 인증 게이트가 사용되며, mock 인증은 production bundle에 포함되지 않습니다.

## 품질 검증

```bash
npm run validate:assets
npm run typecheck
npm run lint
npm run test:run
npm run build
npm run test:e2e -- tests/e2e --workers=1
```

개발 중에는 `D`로 플레이어 스프라이트/히트박스 오버레이를, `F`로 속도·청크·수집·장애물 지표를 켤 수 있습니다. 이 오버레이와 테스트 API는 개발 빌드에만 존재합니다.

## 화면 증거

거리 구간별 레이어 캡처는 [screenshots/T16/metadata.json](screenshots/T16/metadata.json)에 기록되어 있습니다. NPC·오디오·미션·디버그 검증 캡처는 각 Task 디렉터리에 보관합니다.

## 운영 경계

- 인증·랭킹·기록 저장은 기존 Entra ID/Azure Functions/Cosmos 흐름을 사용합니다.
- 서버 payload는 기존 `distanceMeters`, `runCoins`, `score` shape를 유지하며 미션 보너스는 `runCoins`에 합산됩니다.
- 오디오 및 raster 에셋 출처는 `public/assets/audio/CREDITS.md`, `public/assets/world/CREDITS.md`에 기록합니다.
