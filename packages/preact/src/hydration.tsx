import {
  type InjectionProvider,
  type FalsyValue,
  Hydrator$,
  StaticHydrator,
  ActiveHydrator,
  provide
} from '@nano_kit/store'
import { useMemo } from 'preact/hooks'
import {
  type InjectorProviderProps,
  InjectorProvider,
  useInjector
} from './core.jsx'

export interface HydrationProviderProps extends InjectorProviderProps {
  /**
   * Dehydrated data as an array of key-value pairs.
   * Pass a falsy value to skip hydration.
   */
  dehydrated?: [string, unknown][] | FalsyValue
  /**
   * Additional injection providers to merge into the child injector.
   */
  injector?: InjectionProvider[]
  /**
   * Whether to reuse an existing Injector or create a new one.
   * `true` by default.
   */
  reuse?: boolean
}

/**
 * Provide hydrated data to child components using an active hydrator.
 * The dehydrated snapshot can be re-applied whenever the `dehydrated` prop changes between renders.
 */
export function HydrationProvider({
  dehydrated,
  injector = [],
  reuse = true,
  children
}: HydrationProviderProps) {
  const currentInjector = useInjector()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const existingHydrator = useMemo(() => currentInjector?.get(Hydrator$, true), [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hydrator = useMemo(() => existingHydrator || new ActiveHydrator(), [])

  if (dehydrated) {
    hydrator.push!(dehydrated)
  }

  if (existingHydrator && reuse) {
    return children
  }

  return (
    <InjectorProvider
      injector={[
        ...injector,
        provide(Hydrator$, hydrator)
      ]}
    >
      {children}
    </InjectorProvider>
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
  injector = [],
  children
}: StaticHydrationProviderProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hydrator = useMemo(() => dehydrated && new StaticHydrator(dehydrated), [])

  return (
    <InjectorProvider
      injector={
        hydrator
          ? [...injector, provide(Hydrator$, hydrator)]
          : injector
      }
    >
      {children}
    </InjectorProvider>
  )
}
