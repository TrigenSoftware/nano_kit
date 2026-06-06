import {
  type AnyAccessor,
  type AnyFn,
  type InjectionProvider,
  InjectionContext,
  dehydrate as storeDehydrate,
  $get
} from '@nano_kit/store'
import {
  getInjectionContext,
  setInjectionContext
} from '@nano_kit/svelte'
import { getRequestEvent } from '$app/server'
import type { HydrationContextParams } from './hydration.js'

export interface ServerContext {
  flight: boolean
  context: InjectionContext
  seen: WeakSet<AnyFn>
  id: number
}

interface RequestEvent {
  request: Request
  locals: {
    nanokitDehydrationContext?: ServerContext
  }
}

const sharedContexts = new Map<number, InjectionContext>()
let contextId = 0

/* @__NO_SIDE_EFFECTS__ */
export function getServerContext(): ServerContext {
  const { locals, request } = getRequestEvent() as RequestEvent

  if (locals.nanokitDehydrationContext) {
    return locals.nanokitDehydrationContext
  }

  const flight = !request.headers.get('accept')?.includes('text/html')
  const seen = new WeakSet<AnyFn>()
  const context = new InjectionContext()

  return locals.nanokitDehydrationContext = {
    flight,
    context,
    seen,
    id: -1
  }
}

/**
 * Checks whether the current request is a SvelteKit data request.
 * @returns True for data requests, false for document requests.
 */
/* @__NO_SIDE_EFFECTS__ */
export function isFlight() {
  return getServerContext().flight
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
 * @returns The unique ID of the shared context.
 */
export function setDehydrationContext(context?: InjectionProvider[]) {
  const ctx = getServerContext()
  const {
    context: dehydrationContext,
    flight
  } = ctx

  if (context) {
    for (const [token, value] of context) {
      dehydrationContext.set(token, value)
    }
  }

  if (!flight) {
    const id = ctx.id = ++contextId

    sharedContexts.set(id, dehydrationContext)

    return id
  }

  return 0
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
    fromRef,
    context = [],
    reuse = true
  }: HydrationContextParams = {}
) {
  const currentContext = getInjectionContext()
  const dehydrationContextRef = $get(fromRef)!

  if (!currentContext && !dehydrationContextRef) {
    throw new Error('Server context reference is required for root hydration context')
  }

  if (currentContext) {
    if (!reuse) {
      setInjectionContext(context)
    }

    return
  }

  const dehydrationContext = sharedContexts.get(dehydrationContextRef)!

  sharedContexts.delete(dehydrationContextRef)

  for (const [token, value] of context) {
    dehydrationContext.set(token, value)
  }

  setInjectionContext(dehydrationContext)
}
