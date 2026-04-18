import type {
  ClientExtension,
  ExtendedClient,
  AnyClientSetting,
  AnyClientExtension
} from './client.types.js'
import {
  type QueryClientContext,
  type MutationClientContext,
  ClientContext
} from './ClientContext.js'
import {
  dataCacheFacade,
  errorCacheFacade,
  loadingCacheFacade
} from './cache.js'
import {
  query,
  infinite,
  operation,
  mutation
} from './queries/index.js'

export type { InfinitePages } from './queries/index.js'
export * from './client.types.js'

/**
 * Create a query client with optional settings and extensions.
 * @param settings - The client settings and extensions.
 * @returns The query client.
 */
/* @__NO_SIDE_EFFECTS__ */
export function client<S extends (AnyClientSetting | AnyClientExtension)[]>(...settings: S) {
  const ctx = new ClientContext()
  const client = {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    query: query.bind(ctx) as typeof query,
    invalidate: (key => ctx.invalidate(key)) as typeof ctx.invalidate,
    revalidate: (key => ctx.revalidate(key)) as typeof ctx.revalidate,
    $data: dataCacheFacade(ctx),
    $error: errorCacheFacade(ctx),
    $loading: loadingCacheFacade(ctx)
  }

  for (const setting of settings) {
    setting(ctx as QueryClientContext & MutationClientContext, client)
  }

  return client as ExtendedClient<typeof client, S>
}

interface InfinitesExtension {
  infinite: typeof infinite
}

/**
 * Extend client with infinite query capability.
 * @returns The client extension.
 */
/* @__NO_SIDE_EFFECTS__ */
export function infinites() {
  return ((ctx, client) => {
    (client as InfinitesExtension).infinite = infinite.bind(ctx)

    return client
  }) as ClientExtension<InfinitesExtension>
}

interface OperationsExtension {
  operation: typeof operation
}

/**
 * Extend client with operation capability.
 * @returns The client extension.
 */
/* @__NO_SIDE_EFFECTS__ */
export function operations() {
  return ((ctx, client) => {
    (client as OperationsExtension).operation = operation.bind(ctx)

    return client
  }) as ClientExtension<OperationsExtension>
}

interface MutationsExtension {
  mutation: typeof mutation
}

/**
 * Extend client with mutation capability.
 * @returns The client extension.
 */
/* @__NO_SIDE_EFFECTS__ */
export function mutations() {
  return ((ctx, client) => {
    (client as MutationsExtension).mutation = mutation.bind(ctx)

    return client
  }) as ClientExtension<MutationsExtension>
}
