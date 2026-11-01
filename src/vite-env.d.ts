/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_AZURE_STATIC_WEB_APP_URL?: string;
  readonly VITE_ASSET_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
