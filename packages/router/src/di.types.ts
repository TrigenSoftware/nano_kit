import type { Navigation } from './navigation.types.js'
import type { Routes } from './types.js'

export interface AppContext {}

export type FromAppContext<K extends string, F = never> = K extends keyof AppContext
  ? AppContext[K]
  : F

export type AppRoutes = FromAppContext<'routes', Routes>

export type AppComponent = FromAppContext<'component', unknown>

export type AppNavigation = Navigation<AppRoutes>
