'use client'
import {
  type InjectionProvider,
  type FalsyValue,
  Hydrator$,
  StaticHydrator,
  ActiveHydrator,
  provide
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
  dehydrated?: [string, unknown][] | FalsyValue
  /**
   * Additional injection providers to merge into the child context.
   */
  context?: InjectionProvider[]
  /**
   * Whether to reuse an existing InjectionContext or create a new one.
   */
  reuse?: boolean
}

/**
 * Provide hydrated data to child components using a active hydrator.
 * Suitable for RSC streaming — the dehydrated snapshot can be re-applied whenever the `dehydrated` prop changes between renders.
 */
export function HydrationProvider({
  dehydrated,
  context = [],
  reuse,
  children
}: HydrationProviderProps) {
  const currentContext = useInjectionContext()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const existingHydrator = useMemo(() => currentContext?.get(Hydrator$, true), [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hydrator = useMemo(() => existingHydrator || new ActiveHydrator(), [])

  if (dehydrated) {
    hydrator.push!(dehydrated)
  }

  if (existingHydrator && reuse) {
    return children
  }

  return (
    <InjectionContextProvider
      context={[
        ...context,
        provide(Hydrator$, hydrator)
      ]}
    >
      {children}
    </InjectionContextProvider>
  )
}

export interface StaticHydrationProviderProps extends Omit<HydrationProviderProps, 'reuse'> {}

/**
 * Provide hydrated data to child components using a static hydrator.
 * Hydration is applied only once from the initial `dehydrated` value.
 * Suitable for classic SSR where the snapshot is known at first render and never changes.
 * Should be used once in the tree, nested usage is not supported and may lead to unexpected results.
 * For nested hydration use {@link HydrationProvider} instead.
 */
export function StaticHydrationProvider({
  dehydrated,
  context = [],
  children
}: StaticHydrationProviderProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hydrator = useMemo(() => dehydrated && new StaticHydrator(dehydrated), [])

  return (
    <InjectionContextProvider
      context={
        hydrator
          ? [...context, provide(Hydrator$, hydrator)]
          : context
      }
    >
      {children}
    </InjectionContextProvider>
  )
}
