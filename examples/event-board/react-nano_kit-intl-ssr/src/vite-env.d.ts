/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EVENT_BOARD_API_ORIGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
