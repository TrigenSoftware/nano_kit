import type { HTMLAnchorAttributes } from 'svelte/elements'
import {
  type Readable,
  derived
} from 'svelte/store'
import {
  type Accessor,
  toSignal
} from '@nano_kit/store'
import { getInject } from '@nano_kit/svelte'
import {
  type AppRoutes,
  type RouteLocation,
  type Routes,
  Location$,
  parseHref
} from '@nano_kit/router'
import type { LinkSettings } from './link.types.js'
import { LinkSettings$ } from './link.js'

export type IsAriaCurrent<R extends Routes> = (url: URL | undefined, location: RouteLocation<R>) => boolean

export interface AriaCurrentSettings<R extends Routes> extends LinkSettings {
  isAriaCurrent?: IsAriaCurrent<R>
}

export interface AriaCurrentProps {
  'href'?: string
  'aria-current'?: HTMLAnchorAttributes['aria-current']
}

export function defaultIsAriaCurrent<R extends Routes>(
  url: URL | undefined,
  location: RouteLocation<R>
): boolean {
  return url?.pathname === location.pathname
}

/* @__NO_SIDE_EFFECTS__ */
function createAriaCurrent<R extends Routes>(
  getLocation: () => Accessor<RouteLocation<R>>,
  isAriaCurrent?: IsAriaCurrent<R>
) {
  return function applyAriaCurrent(
    $props: Readable<AriaCurrentProps>,
    settings: AriaCurrentSettings<R>
  ) {
    const $location = toSignal(getLocation())
    const finalIsAriaCurrent = settings.isAriaCurrent ?? isAriaCurrent ?? defaultIsAriaCurrent

    return derived([$props, $location], ([
      {
        href,
        'aria-current': ariaCurrent
      },
      location
    ]) => {
      const url = href !== undefined ? parseHref(href) : undefined

      return {
        'aria-current': ariaCurrent ?? (
          finalIsAriaCurrent(url, location)
            ? 'page' as const
            : undefined
        )
      }
    })
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
  return createAriaCurrent(() => $location, isAriaCurrent)
}

const applyAriaCurrent = /* @__PURE__ */ createAriaCurrent(() => getInject(Location$))

/**
 * Enable automatic `aria-current` handling for Link component.
 * Should be used inside injection context with route location and link settings provided.
 * @param isAriaCurrent - Custom predicate to determine whether the link is current.
 */
export function enableLinkComponentAriaCurrent(
  isAriaCurrent?: IsAriaCurrent<AppRoutes>
) {
  const settings: AriaCurrentSettings<AppRoutes> = getInject(LinkSettings$)

  settings.isAriaCurrent = isAriaCurrent
  settings.addHook(applyAriaCurrent)
}
