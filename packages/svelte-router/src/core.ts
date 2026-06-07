import { onMount } from 'svelte'
import {
  type Accessor,
  computed
} from '@nano_kit/store'
import {
  getInjectionContext,
  getInject
} from '@nano_kit/svelte'
import {
  type LayoutMatchRef,
  type PageMatchRef,
  type PageRef,
  type RouteLocationRecord,
  type Routes,
  Page$,
  router as vanillaRouter,
  syncHead as vanillaSyncHead
} from '@nano_kit/router'
import type { PageComponent } from './types.js'
import Composed from './Composed.svelte'

export function compose(
  outlet: Accessor<PageComponent | null>,
  layout: PageComponent
): PageComponent {
  return ((internals, props) => Composed(internals, Object.assign(props, {
    layout,
    outlet
  }))) as PageComponent
}

/**
 * Creates a computed signal that matches the current route against page and layout definitions.
 * Supports nested layouts with composition function for combining layouts with nested content.
 * @param $location - Route match signal containing route and parameters
 * @param pages - Array of page and layout match references
 * @returns Accessor with matched page or null.
 */
/* @__NO_SIDE_EFFECTS__ */
export function router<R extends Routes, K extends keyof R & string>(
  $location: RouteLocationRecord<R>,
  pages: (
    | PageMatchRef<NoInfer<K>, PageComponent>
    | PageMatchRef<null, PageComponent>
    | LayoutMatchRef<NoInfer<K>, PageComponent, PageComponent>
  )[]
): Accessor<PageRef<PageComponent> | null> {
  return vanillaRouter($location, pages, compose)
}

/**
 * Creates a signal for the current page component.
 * @param $page - Signal containing the current page match reference.
 * @returns Signal containing the current page component, or undefined if no page is matched.
 */
/* @__NO_SIDE_EFFECTS__ */
export function getPageSignal($page: Accessor<PageRef<PageComponent> | null>) {
  return computed(() => $page()?.default)
}

/**
 * Gets the current page component signal from injection context.
 * Should be called during component initialization inside an injection context with page provided.
 * @returns Signal containing the current page component, or undefined if no page is matched.
 */
/* @__NO_SIDE_EFFECTS__ */
export function getPage() {
  const $page = getInject(Page$)

  return getPageSignal($page)
}

/**
 * Syncs the document head with the current page's head configuration.
 * @param $page - Signal containing the current page match reference.
 */
export function syncPageHead($page: Accessor<PageRef<unknown> | null>) {
  onMount(() => vanillaSyncHead($page))
}

/**
 * Syncs the document head with the current page's head configuration within injection context.
 * Should be used inside injection context with page provided.
 */
export function syncHead() {
  const context = getInjectionContext()
  const $page = getInject(Page$)

  onMount(() => vanillaSyncHead($page, context))
}
