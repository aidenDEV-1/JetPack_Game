# Azure 운영 설정

## 필요한 관리자 입력

- 회사 Entra Tenant ID
- Azure Subscription ID와 리소스 그룹
- `koreacentral` 리전 사용 승인 여부
- Static Web Apps 도메인과 회사 DNS 정책
- GitHub Actions의 `AZURE_STATIC_WEB_APPS_API_TOKEN` secret
- Entra 앱 등록의 Client ID·Secret을 Static Web Apps 앱 설정에 등록

## 배포 순서

1. `infra/parameters.example.json`을 복사해 회사 Tenant ID와 승인된 리전으로 채운다. 실제 secret은 파일에 커밋하지 않는다.
2. `az deployment group what-if --resource-group <RESOURCE_GROUP> --template-file infra/main.bicep --parameters @infra/parameters.json`으로 리소스 변경을 검토한다.
3. 관리자 승인 후 `az deployment group create`를 실행한다.
4. Static Web Apps의 custom Entra provider issuer를 `https://login.microsoftonline.com/<COMPANY_TENANT_ID>/v2.0`으로 설정한다.
5. Entra 앱 등록의 callback URL을 Static Web Apps 인증 callback에 추가한다.
6. Function App의 System Assigned Managed Identity에 Cosmos SQL Data Contributor만 부여하고 Owner 권한은 부여하지 않는다.
7. GitHub Actions secret을 등록하고 `main` push로 staging 배포를 확인한다.

## 비밀값 규칙

- `api/local.settings.json`, Entra Client Secret, Static Web Apps deployment token은 커밋하지 않는다.
- Cosmos는 `COSMOS_ENDPOINT`와 Managed Identity를 우선 사용한다.
- Key Vault는 외부 서비스 secret이 추가될 때 사용하며, 앱 설정에는 Key Vault reference 또는 Managed Identity를 사용한다.
- 브라우저의 `VITE_*` 값에는 secret을 넣지 않는다.
