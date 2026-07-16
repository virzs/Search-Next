/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EDITOR_AI_API_KEY?: string;
  readonly VITE_RELEASE_TAG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
