/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RELEASE_TAG?: string;
  readonly VITE_BUILD_TIME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
