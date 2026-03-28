import {
  type FocusEvent,
  type MouseEvent,
  useCallback,
  useEffect
} from 'react'
import { inject } from '@nano_kit/store'
import { useInject } from '@nano_kit/react'
import {
  type Navigation,
  type Paths,
  type Routes,
  type UnknownMatchRef,
  type AppRoutes,
  Navigation$,
  Pages$,
  loadPage,
  onLinkClick,
  listenLinks
} from '@nano_kit/router'
import type {
  LinkProps,
  UsePreloadProps,
  LinkSettings
} from './link.types.js'
import {
  useNavigation,
  usePaths
} from './hooks.js'

/* @__NO_SIDE_EFFECTS__ */
function createUsePreloadHook(
  usePages: () => UnknownMatchRef[],
  defaultSettings: Pick<LinkSettings, 'preloaded' | 'preloadByDefault'> = {}
) {
  return function usePreload(
    {
      onFocus,
      onMouseEnter,
      preload
    }: UsePreloadProps,
    to: string | undefined,
    settings = defaultSettings
  ) {
    const pages = usePages()
    const preloaded = settings.preloaded ??= new Set<string>()
    const shouldPreload = preload ?? settings.preloadByDefault
    const preloadCallback = useCallback(() => {
      if (to && shouldPreload && !preloaded.has(to)) {
        preloaded.add(to)
        void loadPage(pages, to)
      }
    }, [to, preload])
    const onFocusCallback = useCallback((event: FocusEvent) => {
      preloadCallback()
      onFocus?.(event)
    }, [onFocus, preloadCallback])
    const onMouseEnterCallback = useCallback((event: MouseEvent) => {
      preloadCallback()
      onMouseEnter?.(event)
    }, [onMouseEnter, preloadCallback])

    return {
      onFocus: onFocusCallback,
      onMouseEnter: onMouseEnterCallback
    }
  }
}

/* @__NO_SIDE_EFFECTS__ */
function createLinkComponent<R extends Routes>(
  useSettings: () => LinkSettings,
  usePaths: () => Paths<R>
) {
  return function Link<K extends keyof Routes>(props: LinkProps<Routes, K>) {
    const {
      to,
      href: hrefProp,
      onClick: onClickProp,
      params,
      ...restProps
    } = props
    const settings = useSettings()
    const {
      onClick,
      usePreload
    } = settings
    const paths = usePaths()
    const path = (to && paths[to]) as string | ((params: unknown) => string) | undefined
    const href = hrefProp ?? (path && (
      typeof path === 'function'
        ? path(params)
        : path
    ))
    const onClickCallback = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
      onClick(event)
      onClickProp?.(event)
    }, [onClick, onClickProp])

    return (
      <a
        href={href}
        onClick={onClickCallback}
        {...restProps}
        {...usePreload?.(restProps, to, settings)}
      />
    )
  }
}

/**
 * Listen raw link clicks on the document to enable navigation without Link component.
 * @param navigation - Router navigation object
 */
export function useListenLinks<R extends Routes = Routes>(navigation: Navigation<R>) {
  useEffect(() => listenLinks(navigation), [navigation])
}

/**
 * Listen raw link clicks on the document to enable navigation without Link component.
 * Should be used inside injection context with navigation provided.
 */
export function useListenLinks$() {
  const navigation = useNavigation()

  useListenLinks(navigation)
}

/**
 * Creates a preload hook for preloading pages on user interaction.
 * @param pages - Array of page and layout match references.
 * @param preloadByDefault - Whether to preload pages by default.
 * @returns Hook function to use for preloading pages.
 */
/* @__NO_SIDE_EFFECTS__ */
export function preloadable(
  pages: UnknownMatchRef[],
  preloadByDefault = false
) {
  return createUsePreloadHook(() => pages, {
    preloaded: new Set<string>(),
    preloadByDefault
  })
}

/**
 * Creates a Link component for navigation.
 * @param navigation - Router navigation object
 * @param paths - Path builders for routes
 * @param usePreload - Preload hook for preloading pages
 * @returns Link component for navigation.
 */
/* @__NO_SIDE_EFFECTS__ */
export function linkComponent<R extends Routes>(
  navigation: Navigation<R>,
  paths: Paths<R>,
  usePreload?: LinkSettings['usePreload']
) {
  const settings = {
    onClick: onLinkClick.bind(navigation as unknown as Navigation),
    usePreload
  }

  return createLinkComponent(() => settings, () => paths)
}

export const usePreload$ = /* @__PURE__ */ createUsePreloadHook(() => useInject(Pages$))

export function LinkSettings$(): LinkSettings {
  const navigation = inject(Navigation$)

  return {
    onClick: onLinkClick.bind(navigation as unknown as Navigation)
  }
}

/**
 * Enable link preloading capabilities for Link component.
 * Should be used inside injection context with navigation and paths provided.
 * @param preloadByDefault - Whether to preload pages by default.
 */
export function useLinkComponentPreload$(preloadByDefault = false) {
  const settings = useInject(LinkSettings$)

  settings.preloadByDefault = preloadByDefault
  settings.usePreload = usePreload$
}

/**
 * Link component for navigation.
 * Should be used inside injection context with navigation and paths provided.
 */
export const Link = /* @__PURE__ */ createLinkComponent<AppRoutes>(
  () => useInject(LinkSettings$),
  () => usePaths()
)
