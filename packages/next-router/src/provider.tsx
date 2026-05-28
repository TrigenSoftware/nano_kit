'use client'
import type { ReactNode } from 'react'
import { provide } from '@nano_kit/store'
import { InjectionContextProvider } from '@nano_kit/react'
import {
  type Routes,
  LocationNavigation$
} from '@nano_kit/router'
import {
  useShouldProvideNextNavigation,
  useNextNavigation
} from './hooks.js'

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
  if (useShouldProvideNextNavigation()) {
    return (
      <InnerProvider routes={routes}>
        {children}
      </InnerProvider>
    )
  }

  return children
}

function InnerProvider<const R extends Routes = Routes>(
  {
    routes,
    children
  }: NextNavigationProviderProps<R>
) {
  return (
    <InjectionContextProvider
      context={[
        // Suppress conflict with AppRoutes
        provide(LocationNavigation$, useNextNavigation(routes) as unknown)
      ]}
    >
      {children}
    </InjectionContextProvider>
  )
}
