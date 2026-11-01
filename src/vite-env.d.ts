/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_AZURE_STATIC_WEB_APP_URL?: string;
  readonly VITE_ASSET_VERSION?: string;
  readonly VITE_ENABLE_DEV_MOCK_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __5PM_RUSH_TEST_API__?: {
    getSnapshot?: () => import('./game/state/GameState').RunState;
    spawnDemoItems?: () => void;
  };
}
