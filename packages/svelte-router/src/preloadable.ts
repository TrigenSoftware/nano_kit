import {
  type Readable,
  derived
} from 'svelte/store'
import { isFunction } from '@nano_kit/store'
import { getInject } from '@nano_kit/svelte'
import type {
  FocusEventHandler,
  MouseEventHandler
} from 'svelte/elements'
import {
  type UnknownMatchRef,
  Pages$,
  loadPage
} from '@nano_kit/router'
import type { LinkSettings } from './link.types.js'
import { LinkSettings$ } from './link.js'

export interface PreloadSettings extends LinkSettings {
  preloaded?: Set<string>
  preloadByDefault?: boolean
}

export interface PreloadProps {
  onfocus?: FocusEventHandler<HTMLAnchorElement> | null
  onmouseenter?: MouseEventHandler<HTMLAnchorElement> | null
  preload?: boolean
  to?: string
}

/* @__NO_SIDE_EFFECTS__ */
function createPreloadHook(
  getPages: () => UnknownMatchRef[],
  preloadByDefault = false
) {
  return function preload(
    $props: Readable<PreloadProps>,
    settings: PreloadSettings
  ) {
    const pages = getPages()
    const preloaded = settings.preloaded ??= new Set<string>()

    return derived($props, ({
      onfocus,
      onmouseenter,
      preload,
      to
    }) => {
      const shouldPreload = preload ?? settings.preloadByDefault ?? preloadByDefault
      const preloadPage = () => {
        if (to && shouldPreload && !preloaded.has(to)) {
          preloaded.add(to)
          void loadPage(pages, to)
        }
      }

      return {
        onfocus(event: FocusEvent & { currentTarget: HTMLAnchorElement }) {
          onfocus?.(event)
          preloadPage()
        },
        onmouseenter(event: MouseEvent & { currentTarget: HTMLAnchorElement }) {
          onmouseenter?.(event)
          preloadPage()
        }
      }
    })
  }
}

/**
 * Creates a preload hook for preloading pages on user interaction.
 * @param pages - Array of page and layout match references.
 * @param preloadByDefault - Whether to preload pages by default.
 * @returns Hook function to use for preloading pages.
 */
/* @__NO_SIDE_EFFECTS__ */
export function preloadable(
  pages: UnknownMatchRef[] | (() => UnknownMatchRef[]),
  preloadByDefault = false
) {
  return createPreloadHook(isFunction(pages) ? pages : () => pages, preloadByDefault)
}

const preload = /* @__PURE__ */ createPreloadHook(() => getInject(Pages$))

/**
 * Enable link preloading capabilities for Link component.
 * Should be used inside injector context with navigation and paths provided.
 * @param preloadByDefault - Whether to preload pages by default.
 */
export function enableLinkComponentPreload(preloadByDefault = false) {
  const settings: PreloadSettings = getInject(LinkSettings$)

  settings.preloadByDefault = preloadByDefault
  settings.addHook(preload)
}
