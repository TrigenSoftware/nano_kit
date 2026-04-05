'use client'
import type { ReactNode } from 'react'
import { provide } from '@nano_kit/store'
import {
  InjectionContextProvider,
  useInjectionContext
} from '@nano_kit/react'
import {
  type AppNavigation,
  type Routes,
  Location$,
  Navigation$
} from '@nano_kit/router'
import { useNextNavigation } from './hooks.js'

export interface NextNavigationProviderProps<R extends Routes = Routes> {
  routes?: R
  children: ReactNode
}

/**
 * Client-side navigation provider for Next.js.
 */
export function NextNavigationProvider<const R extends Routes = Routes>(
  {
    routes,
    children
  }: NextNavigationProviderProps<R>
) {
  const context = useInjectionContext()

  if (context?.get(Location$, true) || context?.get(Navigation$, true)) {
    return children
  }

  return (
    <InnerProvider routes={routes}>
      {children}
    </InnerProvider>
  )
}

function InnerProvider<const R extends Routes = Routes>(
  {
    routes,
    children
  }: NextNavigationProviderProps<R>
) {
  const [$location, navigation] = useNextNavigation(routes)

  return (
    <InjectionContextProvider
      context={[
        provide(Location$, $location),
        // Suppress conflict with AppRoutes
        provide(Navigation$, navigation as unknown as AppNavigation)
      ]}
    >
      {children}
    </InjectionContextProvider>
  )
}
