'use client'
import {
  type MouseEvent,
  useEffect
} from 'react'
import { inject } from '@nano_kit/store'
import { useInject } from '@nano_kit/react'
import {
  type Navigation,
  type Paths,
  type Routes,
  type AppRoutes,
  Navigation$,
  onLinkClick,
  listenLinks
} from '@nano_kit/router'
import {
  type LinkSettingsHook,
  type LinkProps,
  type LinkSettings
} from './link.types.js'
import {
  useNavigation,
  usePaths
} from './hooks.js'
import { useEventCallback } from './utils.js'

export * from './link.types.js'

/* @__NO_SIDE_EFFECTS__ */
function createLinkComponent<R extends Routes>(
  useSettings: () => LinkSettings,
  usePaths: () => Paths<R>
) {
  return function Link<K extends keyof R & string>(props: LinkProps<R, K>) {
    const {
      onClick: onClickProp,
      ...hookProps
    } = props
    const {
      to,
      params,
      href: hrefProp,
      preload,
      ...elementProps
    } = hookProps
    const settings = useSettings()
    const {
      onClick,
      hook
    } = settings
    const paths = usePaths()
    const path = (to && paths[to]) as string | ((params: unknown) => string) | undefined
    const href = hrefProp ?? (path && (
      typeof path === 'function'
        ? path(params)
        : path
    ))
    const onClickCallback = useEventCallback((event: MouseEvent<HTMLAnchorElement>) => {
      onClickProp?.(event)

      if (!event.defaultPrevented) {
        onClick(event)
      }
    })

    hookProps.href = href

    return (
      <a
        href={href}
        onClick={onClickCallback}
        {...elementProps}
        {...hook?.(hookProps, settings)}
      />
    )
  }
}

function createLinkSettings<R extends Routes>(
  navigation: Navigation<R>
) {
  const seen = new Set<LinkSettingsHook>()
  const settings = {
    onClick: onLinkClick.bind(navigation as unknown as Navigation),
    addHook(hook: LinkSettingsHook) {
      if (!seen.has(hook)) {
        seen.add(hook)

        const prevHook = settings.hook

        settings.hook = prevHook
          ? (props, settings) => ({
            ...prevHook(props, settings),
            ...hook(props, settings)
          })
          : hook
      }
    }
  } as LinkSettings

  return settings
}

/**
 * Listen raw link clicks on the document to enable navigation without Link component.
 * @param navigation - Router navigation object
 */
export function useNavigationListenLinks<R extends Routes = Routes>(navigation: Navigation<R>) {
  useEffect(() => listenLinks(navigation), [navigation])
}

/**
 * Listen raw link clicks on the document to enable navigation without Link component.
 * Should be used inside injection context with navigation provided.
 */
export function useListenLinks() {
  const navigation = useNavigation()

  useNavigationListenLinks(navigation)
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
  hooks?: LinkSettingsHook[]
) {
  const settings = createLinkSettings(navigation)

  hooks?.forEach(settings.addHook)

  return createLinkComponent(() => settings, () => paths)
}

export function LinkSettings$(): LinkSettings {
  const navigation = inject(Navigation$)

  return createLinkSettings(navigation)
}

/**
 * Link component for navigation.
 * Should be used inside injection context with navigation and paths provided.
 */
export const Link = /* @__PURE__ */ createLinkComponent<AppRoutes>(
  () => useInject(LinkSettings$),
  () => usePaths()
)
