import {
  type AnyAccessor,
  type AnyFn,
  type InjectionFactory,
  type InjectionProvider,
  InjectionContext,
  dehydrate as storeDehydrate
} from '@nano_kit/store'
// eslint-disable-next-line import/extensions
import { getRequestEvent } from '$app/server'

export interface ServerContext {
  flight: boolean
  context: InjectionContext
  seen: WeakSet<AnyFn>
}

interface RequestEvent {
  request: Request
  locals: {
    nanokitDehydrationContext?: ServerContext
  }
}

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
    seen
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
 */
export function setDehydrationContext(context: InjectionProvider[]) {
  const dehydrationContext = getDehydrationContext()

  for (const [token, value] of context) {
    if (!dehydrationContext.get(token, true)) {
      dehydrationContext.set(token, value)
    }
  }
}

/**
 * Runs stores in the request-scoped dependency injection context and returns their snapshot.
 * Stores are dehydrated only once per request.
 * @param Stores$ - Factory function that returns an array of stores to run and dehydrate.
 * @returns Dehydrated data as an array of key-value pairs.
 */
/* @__NO_SIDE_EFFECTS__ */
export async function dehydrate(Stores$: InjectionFactory<AnyAccessor[]>) {
  const { context, seen } = getServerContext()

  return await storeDehydrate(
    () => Stores$().filter(
      store => !seen.has(store) && (seen.add(store), true)
    ),
    context
  )
}
