import {
  type AnyAccessor,
  type FalsyValue,
  type AnyFn,
  type InjectionProvider,
  InjectionContext,
  dehydrate as storeDehydrate
} from '@nano_kit/store'
import {
  type PropsWithChildren,
  cache
} from 'react'
import type { InjectionContextProps } from './core.jsx'
import { HydrationProvider } from './hydration.jsx'

/** Internal dehydration state shared within a single RSC request. */
export interface ServerContext {
  flight: boolean
  context: InjectionContext
  seen: WeakSet<AnyFn>
}

/**
 * Get the server context for the current RSC request.
 * @returns The server context.
 */
export const getServerContext = /* @__PURE__ */ cache((): ServerContext => {
  const seen = new WeakSet<AnyFn>()
  const context = new InjectionContext()

  return {
    flight: true,
    context,
    seen
  }
})

/**
 * Gets the request-scoped dependency injection context used during dehydration.
 * @returns Dehydration dependency injection context.
 */
export function getDehydrationContext() {
  return getServerContext().context
}

/**
 * Injects dependencies into the request-scoped dehydration context.
 * @param context - Dependencies to inject into the dehydration context.
 */
export function setDehydrationContext(context: InjectionProvider[] | undefined) {
  if (context) {
    const dehydrationContext = getDehydrationContext()

    for (const [token, value] of context) {
      dehydrationContext.set(token, value)
    }
  }
}

/**
 * Run stores in the shared within a single RSC request injection context
 * and return only the dehydrated snapshot.
 * @param Stores$ - Factory function that returns an array of stores to run and dehydrate.
 * @returns Dehydrated data as an array of key-value pairs.
 */
export async function dehydrate(Stores$: () => AnyAccessor[]) {
  const { context, seen } = getServerContext()

  return await storeDehydrate(
    () => Stores$().filter(
      store => !seen.has(store) && (seen.add(store), true)
    ),
    context
  )
}

export interface DehydrationProps extends InjectionContextProps {
  /**
   * Factory function that returns an array of stores to run and dehydrate.
   */
  stores?(): AnyAccessor[]
  /**
   * Pre-dehydrated data. If provided, skips `stores` dehydration.
   */
  dehydrated?: [string, unknown][] | FalsyValue
  /**
   * Additional injection providers to merge into the server context.
   */
  context?: InjectionProvider[]
  /**
   * Whether to create a new InjectionContext for this dehydration or reuse an existing one from the context.
   */
  isolate?: boolean
}

/**
 * RSC component that dehydrates stores and streams the snapshot to the client
 * (reactive hydration, suitable for RSC streaming).
 */
export async function Dehydration({
  stores,
  dehydrated,
  context,
  isolate,
  children
}: DehydrationProps) {
  setDehydrationContext(context)

  return (
    <HydrationProvider
      dehydrated={dehydrated || stores && await dehydrate(stores)}
      reuse={!isolate}
    >
      {children}
    </HydrationProvider>
  )
}

/**
 * RSC component that marks the current request as a non-flight render.
 * Place it in the layout root to tell {@link StaticDehydration} that
 * this is a regular HTML render and dehydration should be included.
 */
export function FlightDetector({ children }: PropsWithChildren) {
  const dctx = getServerContext()

  dctx.flight = false

  return children
}

export interface StaticDehydrationProps extends DehydrationProps {
  /**
   * Override whether this render is a flight request.
   * Defaults to the value detected by {@link FlightDetector} in the current request.
   * When `true`, dehydration is skipped.
   */
  flight?: boolean
}

/**
 * RSC component that dehydrates stores for a classic SSR (non-streaming) render.
 * Skips dehydration when the request is a flight request.
 */
export async function StaticDehydration({
  flight,
  stores,
  dehydrated,
  context,
  isolate,
  children
}: StaticDehydrationProps) {
  const dctx = getServerContext()
  const isFlight = flight === undefined ? dctx.flight : flight

  setDehydrationContext(context)

  return (
    <HydrationProvider
      dehydrated={isFlight ? null : dehydrated || stores && await dehydrate(stores)}
      reuse={!isolate}
    >
      {children}
    </HydrationProvider>
  )
}
