import {
  type ComponentInternals,
  onMount
} from 'svelte'
import type { HTMLAnchorAttributes } from 'svelte/elements'
import {
  type Readable,
  derived
} from 'svelte/store'
import { inject as storeInject } from '@nano_kit/store'
import { inject } from '@nano_kit/svelte'
import {
  type Navigation,
  type Paths,
  type Routes,
  Navigation$,
  Paths$,
  listenLinks as routerListenLinks,
  onLinkClick
} from '@nano_kit/router'
import type {
  LinkProps,
  LinkSettings,
  LinkSettingsHook
} from './link.types.js'
import LinkComponent from './LinkComponent.svelte'

export * from './link.types.js'

/* @__NO_SIDE_EFFECTS__ */
function createLinkComponent<R extends Routes>(
  useSettings: () => LinkSettings,
  usePaths: () => Paths<R>
) {
  return <K extends keyof R & string>(
    internals: ComponentInternals,
    props: LinkProps<R, K>
  ) => LinkComponent(internals, {
    ...props,
    // Suppress conflict with AppRoutes
    paths: usePaths() as unknown as Paths<Routes>,
    settings: useSettings()
  })
}

function createLinkSettings<R extends Routes>(
  navigation: Navigation<R>
) {
  const hooks = new Set<LinkSettingsHook>()
  const settings = {
    onClick: onLinkClick.bind(navigation as unknown as Navigation),
    addHook(hook: LinkSettingsHook) {
      hooks.add(hook)
    },
    hook($props, settings) {
      const deps: Readable<Partial<HTMLAnchorAttributes>>[] = []

      hooks.forEach(hook => deps.push(hook($props, settings)))

      return derived(deps, hookProps => Object.assign({}, ...hookProps) as Partial<HTMLAnchorAttributes>)
    }
  } as LinkSettings

  return settings
}

/**
 * Listen raw link clicks on the document to enable navigation without Link component.
 * @param navigation - Router navigation object.
 */
export function listenNavigationLinks<R extends Routes = Routes>(
  navigation: Navigation<R>
) {
  onMount(() => routerListenLinks(navigation))
}

/**
 * Listen raw link clicks on the document to enable navigation without Link component.
 * Should be used inside injection context with navigation provided.
 */
export function listenLinks() {
  const navigation = inject(Navigation$)

  listenNavigationLinks(navigation)
}

/**
 * Creates a Link component for navigation.
 * @param navigation - Router navigation object.
 * @param paths - Path builders for routes.
 * @param hooks - Link settings hooks.
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
  const navigation = storeInject(Navigation$)

  return createLinkSettings(navigation)
}

/**
 * Link component for navigation.
 * Should be used inside injection context with navigation and paths provided.
 */
export const Link = /* @__PURE__ */ createLinkComponent(
  () => inject(LinkSettings$),
  () => inject(Paths$)
)
