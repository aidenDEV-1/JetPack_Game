# Task: T12 Azure Deployment

## Status: pending

## Goal
Azure 구독에 Static Web Apps, Functions, Cosmos DB를 배포하고 회사 Entra ID·Managed Identity·Key Vault 기반 운영 구성을 완성한다.

## Decision Summary
- 회사 Azure 구독과 회사 테넌트가 리소스 소유권의 기준이다.
- 비밀값은 Key Vault 또는 Azure 애플리케이션 설정에 두고 프론트엔드 번들에는 포함하지 않는다.

## Implementation

### I01. Infrastructure configuration
- Related Files:
  - `infra/main.bicep` — Azure resources; new
  - `infra/parameters.example.json` — non-secret deployment parameters; new
  - `azure-static-web-apps.yml` — build/deploy workflow; new
  - `api/.funcignore` — server-only exclusions; new

#### Details
- Provision Static Web Apps, Function App, Cosmos DB account/database/container, Key Vault, and Application Insights in the company resource group.
- Cosmos container partition key is `/userId`; enable serverless only if the company subscription policy permits it.
- Assign Function App Managed Identity the minimum Cosmos data-plane role; do not use Owner.
- Configure Static Web Apps custom Entra provider issuer with `https://login.microsoftonline.com/<COMPANY_TENANT_ID>/v2.0`.

### I02. Environment and release gates
- Related Files:
  - `.github/workflows/ci.yml` — pull request checks; new
  - `.github/workflows/deploy.yml` — main deployment; new
  - `docs/azure-setup.md` — manual tenant/resource setup; new

#### Details
- PR workflow runs install, lint, typecheck, unit tests, and build.
- Main workflow deploys only after checks pass and receives Azure deployment credentials through GitHub/Azure secret storage.
- Document required admin actions: Entra app registration, tenant restriction, Static Web Apps authentication, Cosmos database, Managed Identity role, Key Vault access, custom domain if applicable.

## Acceptance Criteria
- [ ] Azure staging URL serves the game and redirects unauthenticated users to Entra login.
- [ ] Company users can save and retrieve records through Functions.
- [ ] No client bundle contains Cosmos endpoint credentials, client secrets, or Key Vault values.
- [ ] Main push deploys only after CI passes.

## Validation
- `npm run lint && npm run typecheck && npm run test:run && npm run build` — CI equivalent passes.
- `az deployment group what-if` — expected resource changes reviewed before apply.
- Staging smoke test in company Chrome/Edge.

## Commit Message
```text
chore(azure): add infrastructure and deployment workflow

Plan: 2026-11-01-dex-escape-5pm-rush
Phase: P04-release-and-validation
Task: T12-azure-deployment

- provision Static Web Apps Functions Cosmos and Key Vault definitions
- add CI gates and main-branch Azure deployment workflow
```

## Progress
- [ ] 구현 완료
- [ ] 검증 통과
- commit: pending
