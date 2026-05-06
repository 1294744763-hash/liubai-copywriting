/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VUE_APP_AI_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
