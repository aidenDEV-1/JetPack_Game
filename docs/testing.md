# 테스트 매트릭스

## 자동 테스트

- `npm run lint`: 저장소 코드 품질.
- `npm run typecheck`: 프론트엔드 타입 검증.
- `npm exec tsc -- -p api/tsconfig.json --noEmit`: Functions 타입 검증.
- `npm run test:run`: 물리, 아이템, 부스터, 장애물, 인증 파서, 시작 연출, 결과 문구, 저장 상태, 랭킹 정렬 검증.
- `VITE_ENABLE_DEV_MOCK_AUTH=true npm run test:e2e`: mock 로그인부터 시작·아이템·부스터·충돌·결과 저장까지 재현하고, 에셋 404/console error와 production guard를 확인한다. `E2E_BASE_URL`을 지정하면 Entra 인증 계정이 필요한 테스트가 활성화된다.

## 개발용 mock 로그인

Azure 연결 전 로컬 게임을 확인하려면 프로젝트 루트의 `.env.local`에 다음 값을 추가한다.

```dotenv
VITE_ENABLE_DEV_MOCK_AUTH=true
```

개발 서버를 다시 시작한 뒤 `http://localhost:5173`에서 `개발용 mock 로그인`을 누르면 `로컬 테스트 사용자`로 게임에 들어갈 수 있다. `import.meta.env.DEV`일 때만 동작하므로 production build에서는 활성화되지 않는다. Azure 연결 후에는 `.env.local`의 값을 `false`로 바꾸거나 삭제한다.

## 브라우저 수동 테스트

최신 Chrome과 Microsoft Edge에서 1280×720, 1366×768, 1920×1080을 확인한다.

1. 비로그인 접근이 Entra 로그인 화면으로 제한되는지 확인한다.
2. 회사 계정 로그인 후 5PM RUSH 시작 버튼이 보이는지 확인한다.
3. 시작 버튼 → 4:59:59 → 5:00:00 → 알람 → 부스터 흐름을 확인한다.
4. 스페이스바 상승·해제 하강, 천장 반발, 바닥 달리기를 확인한다.
5. 코인·토큰·방어막, 토큰 3개 부스터, 1회 방어를 확인한다.
6. 미사일 경고 화살표와 예고 없는 강제 충돌 패턴을 확인한다.
7. 설정 아이콘, 자동 일시정지, 3·2·1 재개, 음소거를 확인한다.
8. 충돌 회전·회색화 후 결과 화면과 정확한 한국어 문구를 확인한다.
9. 결과 저장, 저장 실패 재시도, TOP 10과 현재 순위를 확인한다.

실제 Entra·Cosmos·Azure 배포 확인은 회사 staging 리소스와 테스트 계정이 준비된 뒤 수행한다.

## 결정적 로컬 E2E hook

개발 서버에서만 `window.__5PM_RUSH_TEST_API__`가 등록된다. `getSnapshot()`은 bridge 상태를 반환하고, `spawnDemoItems()`, `spawnDemoObstacle()`, `activateBooster()`, `deactivateBooster()`, `forceCrash()`는 실제 Phaser 장면의 이벤트를 호출한다. 테스트가 끝나면 GameShell unmount에서 hook을 삭제하며 production build에는 이 API가 포함되지 않는다.

Playwright는 1280×720 화면에서 시작/부스터/우측 장애물 warning screenshot을 캡처하고, `/assets/` 응답 오류와 uncaught console error를 실패로 처리한다. player debug snapshot으로 attachment 1개, persistent trail 없음, 몸체 collision bounds를 확인하고 obstacle snapshot으로 우측 warning 위치와 표시 크기를 확인한다. 캡처 이미지는 `test-results/` 아래에만 생성되므로 저장소에는 커밋하지 않는다.
