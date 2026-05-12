import type { routes } from './stores/router'

declare global {
  namespace App {}
}

declare module '@nano_kit/router' {
  interface AppContext {
    routes: typeof routes
  }
}

export {}
