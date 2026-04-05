import { connection } from 'next/server'
import {
  permanentRedirect,
  redirect,
  RedirectType
} from 'next/navigation'
import { workUnitAsyncStorage } from 'next/dist/server/app-render/work-unit-async-storage.external.js'
import { cache } from 'react'
import {
  type Routes,
  type RouteLocationRecord,
  type Navigation,
  type AppNavigation,
  Location$,
  Navigation$,
  PushHistoryAction,
  PermanentReplaceHistoryAction,
  virtualNavigation
} from '@nano_kit/router'
import { getServerDehydrationContext } from '@nano_kit/react'
import {
  type NextNavigationProviderProps,
  NextNavigationProvider
} from './provider.jsx'

interface NextAsyncStorage {
  url?: {
    pathname: string
    search: string
  }
  tags?: string[]
}

function getUrlFromAsyncStorage() {
  const store = workUnitAsyncStorage.getStore() as NextAsyncStorage | undefined
  const url = store?.url
  const tags = store?.tags

  if (url) {
    return `${url.pathname || ''}${url.search || ''}`
  }

  if (tags && tags.length > 1) {
    const tag = tags.at(-1)!
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const prevTag = tags.at(-2)!

    if (tag.replace(prevTag, '') !== 'index') {
      return tag.substring(tag.indexOf('/'))
    }
  }

  return '/'
}

/**
 * Creates a navigation for the current RSC request.
 * Navigation actions (`push`, `replace`) trigger Next.js `redirect()` on the server.
 * @param routes - Route definitions for the application.
 * @returns Tuple of location signal and navigation object.
 */
export const getServerNextNavigation = cache(<R extends Routes = Routes>(
  routes: R = {} as R
): [RouteLocationRecord<R>, Navigation<R>] => {
  const url = getUrlFromAsyncStorage()
  const [$location, navigation] = virtualNavigation(url, routes)
  const superTransition = navigation.transition

  navigation.transition = (fn, nextLocation, prevLocation) => {
    superTransition(fn, nextLocation, prevLocation)

    if (nextLocation) {
      const action = nextLocation.action === PushHistoryAction
        ? RedirectType.push
        : RedirectType.replace

      if (nextLocation.action === PermanentReplaceHistoryAction) {
        permanentRedirect(nextLocation.href, action)
      } else {
        redirect(nextLocation.href, action)
      }
    }
  }

  return [$location, navigation]
})

export interface NextNavigationProps<R extends Routes = Routes> extends NextNavigationProviderProps<R> {
  prerenderable?: boolean
}

/**
 * RSC component that sets up navigation on the server and hydrates it on the client.
 */
export async function NextNavigation<const R extends Routes = Routes>(
  {
    routes,
    prerenderable,
    children
  }: NextNavigationProps<R>
) {
  if (!prerenderable) {
    await connection()
  }

  const { context } = getServerDehydrationContext()

  if (!context.get(Location$, true) && !context.get(Navigation$, true)) {
    const [$location, navigation] = getServerNextNavigation(routes)

    context.set(Location$, $location)
    // Suppress conflict with AppRoutes
    context.set(Navigation$, navigation as unknown as AppNavigation)
  }

  return (
    <NextNavigationProvider
      routes={routes}
    >
      {children}
    </NextNavigationProvider>
  )
}
