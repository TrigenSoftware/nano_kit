import {
  type AnyAccessor,
  type InjectionProvider,
  type InjectionFactory,
  type FalsyValue,
  type AnyFn,
  InjectionContext,
  contextDehydrate
} from '@nano_kit/store'
import {
  type PropsWithChildren,
  cache
} from 'react'
import type { InjectionContextProps } from './core.jsx'
import { HydrationProvider } from './hydration.jsx'

/** Internal dehydration state shared within a single RSC request. */
export interface ServerDehydrationContext {
  flight: boolean
  context: InjectionContext
  seen: WeakSet<AnyFn>
}

/**
 * Get the dehydration context for the current RSC request.
 * @returns The dehydration context.
 */
export const getServerDehydrationContext = /* @__PURE__ */ cache((): ServerDehydrationContext => {
  const seen = new WeakSet<AnyFn>()
  const context = new InjectionContext()

  return {
    flight: true,
    context,
    seen
  }
})

/**
 * Run stores in the shared within a single RSC request injection context
 * and return both the context and the dehydrated snapshot.
 * @param Stores$ - Factory function that returns an array of stores to run and dehydrate.
 * @returns A tuple of the injection context and the dehydrated key-value pairs.
 */
export async function serverContextDehydrate(Stores$: InjectionFactory<AnyAccessor[]>) {
  const { context, seen } = getServerDehydrationContext()

  return await contextDehydrate(
    () => Stores$().filter(
      store => !seen.has(store) && (seen.add(store), true)
    ),
    context
  )
}

/**
 * Run stores in the shared within a single RSC request injection context
 * and return only the dehydrated snapshot.
 * @param Stores$ - Factory function that returns an array of stores to run and dehydrate.
 * @returns Dehydrated data as an array of key-value pairs.
 */
export async function serverDehydrate(Stores$: InjectionFactory<AnyAccessor[]>) {
  const [, dehydrated] = await serverContextDehydrate(Stores$)

  return dehydrated
}

export interface DehydrationProps extends InjectionContextProps {
  /**
   * Factory function that returns an array of stores to run and dehydrate.
   */
  stores?: InjectionFactory<AnyAccessor[]>
  /**
   * Pre-dehydrated data. If provided, skips `stores` dehydration.
   */
  dehydrated?: [string, unknown][] | FalsyValue
  /**
   * Additional injection providers to merge into the child context.
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
  return (
    <HydrationProvider
      dehydrated={dehydrated || stores && await serverDehydrate(stores)}
      context={context}
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
  const dctx = getServerDehydrationContext()

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
  const dctx = getServerDehydrationContext()
  const isFlight = flight === undefined ? dctx.flight : flight

  return (
    <HydrationProvider
      dehydrated={isFlight ? null : dehydrated || stores && await serverDehydrate(stores)}
      context={context}
      reuse={!isolate}
    >
      {children}
    </HydrationProvider>
  )
}
