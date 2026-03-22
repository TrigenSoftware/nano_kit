'use client'
import {
  type InjectionProvider,
  type FalsyValue,
  Hydrator$,
  provide,
  activeHydrator,
  hydrator,
  signal
} from '@nano_kit/store'
import { useMemo } from 'react'
import {
  type InjectionContextProps,
  InjectionContextProvider,
  useInjectionContext
} from './core.jsx'

export interface HydrationProviderProps extends InjectionContextProps {
  /**
   * Dehydrated data as an array of key-value pairs.
   * Pass a falsy value to skip hydration.
   */
  dehydrated: [string, unknown][] | FalsyValue
  /**
   * Additional injection providers to merge into the child context.
   */
  context?: InjectionProvider[]
}

/**
 * Provide hydrated data to child components using a active hydrator.
 * Suitable for RSC streaming — the dehydrated snapshot is stored in a signal
 * and re-applied whenever the `dehydrated` prop changes between renders.
 * Falls back to the parent {@link Hydrator$} when a key is not found.
 */
export function HydrationProvider({
  dehydrated,
  context = [],
  children
}: HydrationProviderProps) {
  const currentContext = useInjectionContext()
  const [$dehydrated, hydrate] = useMemo(() => {
    const $dehydrated = signal<[string, unknown][]>([])
    const parent = currentContext?.has(Hydrator$) ? currentContext.get(Hydrator$) : null
    const hydrate = activeHydrator($dehydrated, parent)

    return [$dehydrated, hydrate] as const
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (dehydrated) {
    $dehydrated(dehydrated)
  }

  return (
    <InjectionContextProvider
      context={[
        ...context,
        provide(Hydrator$, hydrate)
      ]}
    >
      {children}
    </InjectionContextProvider>
  )
}

/**
 * Provide hydrated data to child components using a static hydrator.
 * Hydration is applied only once from the initial `dehydrated` value.
 * Suitable for classic SSR where the snapshot is known at first render and never changes.
 * Falls back to the parent {@link Hydrator$} when a key is not found.
 */
export function InitialHydrationProvider({
  dehydrated,
  context = [],
  children
}: HydrationProviderProps) {
  const currentContext = useInjectionContext()
  const hydrate = useMemo(() => {
    if (!dehydrated) {
      return null
    }

    const parent = currentContext?.has(Hydrator$) ? currentContext.get(Hydrator$) : null
    const hydrate = hydrator(dehydrated, parent)

    return hydrate
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <InjectionContextProvider
      context={
        hydrate
          ? [...context, provide(Hydrator$, hydrate)]
          : context
      }
    >
      {children}
    </InjectionContextProvider>
  )
}
