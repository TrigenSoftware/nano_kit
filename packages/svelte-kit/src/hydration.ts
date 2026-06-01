import {
  type FalsyValue,
  type InjectionProvider,
  type ValueOrAccessor,
  Hydrator$,
  ActiveHydrator,
  provide,
  $get
} from '@nano_kit/store'
import {
  getInjector,
  setInjector
} from '@nano_kit/svelte'

export interface HydrationInjectorParams {
  /**
   * Create hydration injector from an existing dehydration injector reference.
   */
  fromRef?: ValueOrAccessor<number>
  /**
   * Dehydrated data as an array of key-value pairs.
   * Pass a falsy value to skip hydration.
   */
  dehydrated?: ValueOrAccessor<[string, unknown][] | FalsyValue>
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
 * Provide hydrated data to child components using a active hydrator.
 * @param params - Hydration injector parameters.
 */
export function setHydrationInjector(
  {
    dehydrated,
    injector = [],
    reuse = true
  }: HydrationInjectorParams = {}
) {
  const currentInjector = getInjector()
  const existingHydrator = currentInjector?.get(Hydrator$, true)
  const hydrator = existingHydrator || new ActiveHydrator()
  const dehydratedValue = $get(dehydrated)

  if (dehydratedValue) {
    hydrator.push!(dehydratedValue)
  }

  if (!existingHydrator || !reuse) {
    setInjector([
      ...injector,
      provide(Hydrator$, hydrator)
    ])
  }
}
