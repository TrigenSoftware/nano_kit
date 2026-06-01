/* eslint-disable import/order */
import {
  type AnyAccessor,
  type AnyFn,
  type InjectionProvider,
  Injector,
  dehydrate as storeDehydrate,
  $get
} from '@nano_kit/store'
import {
  getInjector,
  setInjector
} from '@nano_kit/svelte'
// eslint-disable-next-line import/extensions
import { getRequestEvent } from '$app/server'
import type { HydrationInjectorParams } from './hydration.js'

export interface ServerContext {
  flight: boolean
  injector: Injector
  seen: WeakSet<AnyFn>
  id: number
}

interface RequestEvent {
  request: Request
  locals: {
    nanokitDehydrationContext?: ServerContext
  }
}

const sharedInjectors = new Map<number, Injector>()
let injectorId = 0

/* @__NO_SIDE_EFFECTS__ */
export function getServerContext(): ServerContext {
  const { locals, request } = getRequestEvent() as RequestEvent

  if (locals.nanokitDehydrationContext) {
    return locals.nanokitDehydrationContext
  }

  const flight = !request.headers.get('accept')?.includes('text/html')
  const seen = new WeakSet<AnyFn>()
  const injector = new Injector()

  return locals.nanokitDehydrationContext = {
    flight,
    injector,
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
 * Gets the request-scoped dependency injector used during dehydration.
 * @returns Dehydration dependency injector.
 */
/* @__NO_SIDE_EFFECTS__ */
export function getDehydrationInjector() {
  return getServerContext().injector
}

/**
 * Merges providers into the request-scoped dehydration injector.
 * Existing providers are preserved.
 * @param injector - Providers to merge into the dehydration injector.
 * @returns The unique ID of the shared injector.
 */
export function setDehydrationInjector(injector?: InjectionProvider[]) {
  const ctx = getServerContext()
  const {
    injector: dehydrationInjector,
    flight
  } = ctx

  if (injector) {
    for (const [token, value] of injector) {
      dehydrationInjector.set(token, value)
    }
  }

  if (!flight) {
    const id = ctx.id = ++injectorId

    sharedInjectors.set(id, dehydrationInjector)

    return id
  }

  return 0
}

/**
 * Runs stores in the request-scoped dependency injector and returns their snapshot.
 * Stores are dehydrated only once per request.
 * @param Stores$ - Factory function that returns an array of stores to run and dehydrate.
 * @returns Dehydrated data as an array of key-value pairs.
 */
/* @__NO_SIDE_EFFECTS__ */
export async function dehydrate(Stores$: () => AnyAccessor[]) {
  const { injector, seen } = getServerContext()

  return await storeDehydrate(
    () => Stores$().filter(
      store => !seen.has(store) && (seen.add(store), true)
    ),
    injector
  )
}

/**
 * Provide hydrated data to child components using an active hydrator.
 * @param params - Hydration injector parameters.
 */
export function setHydrationInjector(
  {
    fromRef,
    injector = [],
    reuse = true
  }: HydrationInjectorParams = {}
) {
  const currentInjector = getInjector()
  const dehydrationInjectorRef = $get(fromRef)!

  if (!currentInjector && !dehydrationInjectorRef) {
    throw new Error('Server injector reference is required for root hydration injector')
  }

  if (currentInjector) {
    if (!reuse) {
      setInjector(injector)
    }

    return
  }

  const dehydrationInjector = sharedInjectors.get(dehydrationInjectorRef)!

  sharedInjectors.delete(dehydrationInjectorRef)

  for (const [token, value] of injector) {
    dehydrationInjector.set(token, value)
  }

  setInjector(dehydrationInjector)
}
