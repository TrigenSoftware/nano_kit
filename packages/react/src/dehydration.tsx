import {
  type AnyAccessor,
  type FalsyValue,
  type AnyFn,
  type InjectionProvider,
  Injector,
  dehydrate as storeDehydrate
} from '@nano_kit/store'
import {
  type PropsWithChildren,
  cache
} from 'react'
import type { InjectorProviderProps } from './core.jsx'
import { HydrationProvider } from './hydration.jsx'

/** Internal dehydration state shared within a single RSC request. */
export interface ServerContext {
  flight: boolean
  injector: Injector
  seen: WeakSet<AnyFn>
}

/**
 * Get the server context for the current RSC request.
 * @returns The server context.
 */
export const getServerContext = /* @__PURE__ */ cache((): ServerContext => {
  const seen = new WeakSet<AnyFn>()
  const injector = new Injector()

  return {
    flight: true,
    injector,
    seen
  }
})

/**
 * Gets the request-scoped dependency injector used during dehydration.
 * @returns Dehydration dependency injector.
 */
export function getDehydrationInjector() {
  return getServerContext().injector
}

/**
 * Injects dependencies into the request-scoped dehydration injector.
 * @param injector - Dependencies to inject into the dehydration injector.
 */
export function setDehydrationInjector(injector: InjectionProvider[] | undefined) {
  if (injector) {
    const dehydrationInjector = getDehydrationInjector()

    for (const [token, value] of injector) {
      dehydrationInjector.set(token, value)
    }
  }
}

/**
 * Run stores in the shared within a single RSC request injector
 * and return only the dehydrated snapshot.
 * @param Stores$ - Factory function that returns an array of stores to run and dehydrate.
 * @returns Dehydrated data as an array of key-value pairs.
 */
export async function dehydrate(Stores$: () => AnyAccessor[]) {
  const { injector, seen } = getServerContext()

  return await storeDehydrate(
    () => Stores$().filter(
      store => !seen.has(store) && (seen.add(store), true)
    ),
    injector
  )
}

export interface DehydrationProps extends InjectorProviderProps {
  /**
   * Factory function that returns an array of stores to run and dehydrate.
   */
  stores?(): AnyAccessor[]
  /**
   * Pre-dehydrated data. If provided, skips `stores` dehydration.
   */
  dehydrated?: [string, unknown][] | FalsyValue
  /**
   * Additional injection providers to merge into the server injector.
   */
  injector?: InjectionProvider[]
  /**
   * Whether to create a new Injector for this dehydration or reuse an existing one from the injector.
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
  injector,
  isolate,
  children
}: DehydrationProps) {
  setDehydrationInjector(injector)

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
  injector,
  isolate,
  children
}: StaticDehydrationProps) {
  const dctx = getServerContext()
  const isFlight = flight === undefined ? dctx.flight : flight

  setDehydrationInjector(injector)

  return (
    <HydrationProvider
      dehydrated={isFlight ? null : dehydrated || stores && await dehydrate(stores)}
      reuse={!isolate}
    >
      {children}
    </HydrationProvider>
  )
}
