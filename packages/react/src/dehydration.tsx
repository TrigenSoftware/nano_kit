import {
  type AnyAccessor,
  type InjectionProvider,
  type InjectionFactory,
  InjectionContext,
  contextDehydrate,
  type FalsyValue
} from '@nano_kit/store'
import {
  type FC,
  type PropsWithChildren,
  cache
} from 'react'
import type { InjectionContextProps } from './core.jsx'
import { HydrationProvider, InitialHydrationProvider } from './hydration.jsx'

/** Internal dehydration state shared across all RSC components within a single flight request. */
export interface DehydrationContext {
  wrapper: (() => FC<PropsWithChildren>) | null
  flight: boolean
  context: InjectionContext
  seen: WeakSet<AnyAccessor>
}

/**
 * Get the dehydration context for the current RSC flight request.
 * Uses React `cache` to ensure a single shared instance per request.
 * @returns The dehydration context.
 */
export const getFlightDehydrationContext = /* @__PURE__ */ cache((): DehydrationContext => {
  const seen = new WeakSet<AnyAccessor>()
  const context = new InjectionContext()

  return {
    wrapper: null,
    flight: true,
    context,
    seen
  }
})

/**
 * Run stores in the shared flight injection context, deduplicating stores already
 * seen in the current request, and return both the context and the dehydrated snapshot.
 * @param Stores$ - Factory function that returns an array of stores to run and dehydrate.
 * @returns A tuple of the injection context and the dehydrated key-value pairs.
 */
export async function flightContextDehydrate(Stores$: InjectionFactory<AnyAccessor[]>) {
  const { context, seen } = getFlightDehydrationContext()

  return await contextDehydrate(
    () => Stores$().filter(
      store => !seen.has(store) && (seen.add(store), true)
    ),
    context
  )
}

/**
 * Run stores in the shared flight injection context, deduplicating stores already
 * seen in the current request, and return only the dehydrated snapshot.
 * @param Stores$ - Factory function that returns an array of stores to run and dehydrate.
 * @returns Dehydrated data as an array of key-value pairs.
 */
export async function flightDehydrate(Stores$: InjectionFactory<AnyAccessor[]>) {
  const [, dehydrated] = await flightContextDehydrate(Stores$)

  return dehydrated
}

export interface DehydrationProviderProps extends InjectionContextProps {
  /**
   * Factory function that returns an array of stores to run and dehydrate.
   * Must be a stable reference — do not create inline during render or per request.
   */
  stores: InjectionFactory<AnyAccessor[]>
  /**
   * Pre-dehydrated data. If provided, skips calling {@link flightDehydrate}.
   */
  dehydrated?: [string, unknown][] | FalsyValue
  /**
   * Additional injection providers to merge into the child context.
   */
  context?: InjectionProvider[]
}

const wrappers = new WeakMap<() => AnyAccessor[], () => FC<PropsWithChildren>>()

function getWrapper(Stores$: () => AnyAccessor[]) {
  const { wrapper } = getFlightDehydrationContext()

  if (wrapper) {
    wrappers.set(Stores$, wrapper)

    return wrapper()
  }

  return wrappers.get(Stores$)?.()
}

/**
 * RSC component that dehydrates stores and streams the snapshot to the client
 * via {@link HydrationProvider} (reactive hydration, suitable for RSC streaming).
 */
export async function DehydrationProvider({
  stores,
  dehydrated,
  context,
  children
}: DehydrationProviderProps) {
  const Wrapper = getWrapper(stores)
  let provider = (
    <HydrationProvider
      dehydrated={dehydrated || await flightDehydrate(stores)}
      context={context}
    >
      {children}
    </HydrationProvider>
  )

  if (Wrapper) {
    provider = (
      <Wrapper>
        {provider}
      </Wrapper>
    )
  }

  return provider
}

/**
 * RSC component that marks the current request as a non-flight render.
 * Place it in the layout root to tell {@link InitialDehydrationProvider} that
 * this is a regular HTML render and dehydration should be included.
 */
export function FlightDetector({ children }: PropsWithChildren) {
  const dctx = getFlightDehydrationContext()

  dctx.flight = false

  return children
}

export interface InitialDehydrationProviderProps extends DehydrationProviderProps {
  /**
   * Override whether this render is a flight request.
   * Defaults to the value detected by {@link FlightDetector} in the current request.
   * When `true`, dehydration is skipped.
   */
  flight?: boolean
}

/**
 * RSC component that dehydrates stores for a classic SSR (non-streaming) render.
 * Uses {@link InitialHydrationProvider} for static one-time hydration.
 * Skips dehydration when the request is a flight request.
 */
export async function InitialDehydrationProvider({
  flight,
  stores,
  dehydrated,
  context,
  children
}: InitialDehydrationProviderProps) {
  const dctx = getFlightDehydrationContext()
  const Wrapper = getWrapper(stores)
  const isFlight = flight === undefined ? dctx.flight : flight
  let provider = (
    <InitialHydrationProvider
      dehydrated={isFlight ? null : dehydrated || await flightDehydrate(stores)}
      context={context}
    >
      {children}
    </InitialHydrationProvider>
  )

  if (Wrapper) {
    provider = (
      <Wrapper>
        {provider}
      </Wrapper>
    )
  }

  return provider
}
