# Task: T02 Entra Authentication

## Status: pending

## Goal
Azure Static Web Apps 기본 Entra ID 인증을 연결하고 회사 테넌트 사용자만 React 앱과 API에 접근하도록 보호한다.

## Decision Summary
- Single-tenant 회사 Entra ID만 허용하며 게스트·개인 Microsoft 계정은 허용하지 않는다.
- Static Web Apps 기본 인증을 사용하고 React에는 `/.auth/me`, `/.auth/login/aad`, `/.auth/logout`만 노출한다.

## Implementation

### I01. Static Web Apps auth configuration
- Related Files:
  - `staticwebapp.config.json` — 인증 라우트와 보호 정책; new
  - `src/services/auth/azureStaticWebAppsAuth.ts` — 사용자 세션 조회; new
  - `src/services/auth/types.ts` — Entra 사용자 타입; new

#### Details
- **Types**:
  ```typescript
  export interface AuthenticatedUser {
    userId: string;
    displayName: string;
    email: string | null;
    tenantId: string;
  }
  export interface AuthService {
    getCurrentUser(): Promise<AuthenticatedUser | null>;
    login(): void;
    logout(): void;
  }
  ```
- Protect `/`, `/game`, `/leaderboard`, and `/api/*` for `authenticated` users. Keep only the login landing route anonymous.
- Configure a custom Entra provider with the company tenant issuer, not the unrestricted preconfigured provider.
- Never persist access tokens, client secrets, or raw claims in local storage.

### I02. Auth state and failure UI
- Related Files:
  - `src/app/App.tsx` — auth-gated routing; modify
  - `src/features/auth/AuthGate.tsx` — loading/login/error states; new
  - `src/features/auth/authCopy.ko.ts` — Korean messages; new

#### Details
1. Call `/.auth/me` on app load.
2. Show loading state while the session is unknown.
3. Show Entra login button when no session exists.
4. Show tenant/access error when session exists but tenant claim is not the configured company tenant.
5. Render game shell only after authenticated user data is available.

## Acceptance Criteria
- [ ] 비로그인 사용자는 로그인 화면 외 게임·랭킹에 접근할 수 없다.
- [ ] 회사 테넌트가 아닌 계정은 차단된다.
- [ ] UI에는 Entra 표시 이름만 게임 플레이어 이름으로 사용된다.
- [ ] 로그인·로그아웃·세션 조회 실패가 한국어로 표시된다.

## Validation
- `npm run typecheck && npm run test:run -- src/features/auth` — auth tests pass.
- Azure Static Web Apps staging URL에서 회사 계정 로그인과 비회사 계정 차단을 확인한다.

## Commit Message
```text
feat(auth): gate game with company Entra ID

Plan: 2026-11-01-dex-escape-5pm-rush
Phase: P01-foundation-and-cloud
Task: T02-entra-authentication

- configure tenant-restricted Static Web Apps auth
- add Korean login, session, and access-denied states
```

## Progress
- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
