import {
  type AnyAccessor,
  type AnyFn,
  type InjectionProvider,
  InjectionContext,
  dehydrate as storeDehydrate
} from '@nano_kit/store'
import {
  getInjectionContext,
  setInjectionContext
} from '@nano_kit/svelte'
import { getRequestEvent } from '$app/server'
import type { HydrationContextParams } from './hydration.js'

export interface ServerContext {
  context: InjectionContext
  seen: WeakSet<AnyFn>
}

interface Locals {
  nanokitDehydrationContext?: ServerContext
}

// The context lives in the locals of the request, which the loads and the render of the page share,
// so nothing of the request outlives it, whether the page renders or not
/* @__NO_SIDE_EFFECTS__ */
export function getServerContext(): ServerContext {
  return (getRequestEvent().locals as Locals).nanokitDehydrationContext ??= {
    context: new InjectionContext(),
    seen: new WeakSet()
  }
}

/**
 * Checks whether the current request is a SvelteKit data request.
 * @returns True for data requests, false for document requests.
 */
/* @__NO_SIDE_EFFECTS__ */
export function isFlight() {
  return getRequestEvent().isDataRequest
}

/**
 * Gets the request-scoped dependency injection context used during dehydration.
 * @returns Dehydration dependency injection context.
 */
/* @__NO_SIDE_EFFECTS__ */
export function getDehydrationContext() {
  return getServerContext().context
}

/**
 * Merges providers into the request-scoped dehydration context.
 * Existing providers are preserved.
 * @param context - Providers to merge into the dehydration context.
 */
export function setDehydrationContext(context: InjectionProvider[] = []) {
  const dehydrationContext = getDehydrationContext()

  for (const [token, value] of context) {
    dehydrationContext.deps.set(token, value)
  }
}

/**
 * Runs stores in the request-scoped dependency injection context and returns their snapshot.
 * Stores are dehydrated only once per request.
 * @param Stores$ - Factory function that returns an array of stores to run and dehydrate.
 * @returns Dehydrated data as an array of key-value pairs.
 */
/* @__NO_SIDE_EFFECTS__ */
export async function dehydrate(Stores$: () => AnyAccessor[]) {
  const { context, seen } = getServerContext()

  return await storeDehydrate(
    () => Stores$().filter(
      store => !seen.has(store) && (seen.add(store), true)
    ),
    context
  )
}

/**
 * Provide hydrated data to child components using a active hydrator.
 * @param params - Hydration context parameters.
 */
export function setHydrationContext(
  {
    context = [],
    reuse = true
  }: HydrationContextParams = {}
) {
  if (getInjectionContext()) {
    if (!reuse) {
      setInjectionContext(context)
    }

    return
  }

  // SvelteKit renders the page inside its request since 2.27, so the root takes the context its loads filled
  setDehydrationContext(context)
  setInjectionContext(getDehydrationContext())
}
