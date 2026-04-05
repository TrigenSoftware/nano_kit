import {
  type FocusEvent,
  type MouseEvent
} from 'react'
import { isFunction } from '@nano_kit/store'
import { useInject } from '@nano_kit/react'
import {
  type UnknownMatchRef,
  Pages$,
  loadPage
} from '@nano_kit/router'
import type { LinkSettings } from './link.types.js'
import { LinkSettings$ } from './link.jsx'
import { useEventCallback } from './utils.js'

export interface UsePreloadSettings extends LinkSettings {
  preloaded?: Set<string>
  preloadByDefault?: boolean
}

export interface UsePreloadProps {
  onFocus?(event: FocusEvent): void
  onMouseEnter?(event: MouseEvent): void
  preload?: boolean
  to?: string
}

/* @__NO_SIDE_EFFECTS__ */
function createUsePreloadHook(
  usePages: () => UnknownMatchRef[],
  preloadByDefault = false
) {
  return function usePreload(
    {
      onFocus,
      onMouseEnter,
      preload,
      to
    }: UsePreloadProps,
    settings: UsePreloadSettings
  ) {
    const pages = usePages()
    const preloaded = settings.preloaded ??= new Set<string>()
    const shouldPreload = preload ?? settings.preloadByDefault ?? preloadByDefault
    const preloadCallback = useEventCallback(() => {
      if (to && shouldPreload && !preloaded.has(to)) {
        preloaded.add(to)
        void loadPage(pages, to)
      }
    })
    const onFocusCallback = useEventCallback((event: FocusEvent) => {
      onFocus?.(event)
      preloadCallback()
    })
    const onMouseEnterCallback = useEventCallback((event: MouseEvent) => {
      onMouseEnter?.(event)
      preloadCallback()
    })

    return {
      onFocus: onFocusCallback,
      onMouseEnter: onMouseEnterCallback
    }
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
  return createUsePreloadHook(isFunction(pages) ? pages : () => pages, preloadByDefault)
}

const usePreload = /* @__PURE__ */ createUsePreloadHook(() => useInject(Pages$))

/**
 * Enable link preloading capabilities for Link component.
 * Should be used inside injection context with navigation and paths provided.
 * @param preloadByDefault - Whether to preload pages by default.
 */
export function useLinkComponentPreload(preloadByDefault = false) {
  const settings: UsePreloadSettings = useInject(LinkSettings$)

  settings.preloadByDefault = preloadByDefault
  settings.addHook(usePreload)
}
