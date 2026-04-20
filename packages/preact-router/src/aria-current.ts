import { useMemo } from 'preact/hooks'
import type {
  AnchorHTMLAttributes,
  AriaAttributes
} from 'preact'
import type { Accessor } from '@nano_kit/store'
import {
  useInject,
  useSignal
} from '@nano_kit/preact'
import {
  type AppRoutes,
  type RouteLocation,
  type Routes,
  parseHref
} from '@nano_kit/router'
import { LinkSettings$ } from './link.jsx'
import { useLocation } from './hooks.js'
import type { LinkSettings } from './link.types.js'

export type IsAriaCurrent<R extends Routes> = (url: URL | undefined, location: RouteLocation<R>) => boolean

export interface UseAriaCurrentSettings<R extends Routes> extends LinkSettings {
  isAriaCurrent?: IsAriaCurrent<R>
}

export interface UseAriaCurrentProps {
  'href'?: AnchorHTMLAttributes['href']
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'aria-current'?: AriaAttributes['aria-current']
}

export function defaultIsAriaCurrent<R extends Routes>(
  url: URL | undefined,
  location: RouteLocation<R>
): boolean {
  return url?.pathname === location.pathname
}

/* @__NO_SIDE_EFFECTS__ */
function createAriaCurrent<R extends Routes>(
  useLocation: Accessor<RouteLocation<R>>,
  isAriaCurrent?: IsAriaCurrent<R>
) {
  return function useAriaCurrent(
    {
      href,
      'aria-current': ariaCurrent
    }: UseAriaCurrentProps,
    settings: UseAriaCurrentSettings<R>
  ) {
    const location = useLocation()
    const url = useMemo(() => (typeof href === 'string' ? parseHref(href) : undefined), [href])
    const finalIsAriaCurrent = settings.isAriaCurrent ?? isAriaCurrent ?? defaultIsAriaCurrent

    return {
      'aria-current': ariaCurrent ?? (
        finalIsAriaCurrent(url, location)
          ? 'page' as const
          : undefined
      )
    }
  }
}

/**
 * Creates a hook for setting `aria-current="page"` based on current location.
 * @param $location - Accessor for the current route location.
 * @param isAriaCurrent - Custom predicate to determine whether the link is current.
 * @returns Hook function to use for calculating the `aria-current` attribute.
 */
/* @__NO_SIDE_EFFECTS__ */
export function ariaCurrent<R extends Routes>(
  $location: Accessor<RouteLocation<R>>,
  isAriaCurrent?: IsAriaCurrent<R>
) {
  return createAriaCurrent(() => useSignal($location), isAriaCurrent)
}

const useAriaCurrent = /* @__PURE__ */ createAriaCurrent(useLocation)

/**
 * Enable automatic `aria-current` handling for Link component.
 * Should be used inside injection context with route location and link settings provided.
 * @param isAriaCurrent - Custom predicate to determine whether the link is current.
 */
export function useLinkComponentAriaCurrent(
  isAriaCurrent?: IsAriaCurrent<AppRoutes>
) {
  const settings: UseAriaCurrentSettings<AppRoutes> = useInject(LinkSettings$)

  settings.isAriaCurrent = isAriaCurrent
  settings.addHook(useAriaCurrent)
}
