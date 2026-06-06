import type { routes } from './stores-di/router'

declare module '@nano_kit/router' {
  interface AppContext {
    routes: typeof routes
  }
}
