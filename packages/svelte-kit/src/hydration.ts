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
  getInjectionContext,
  setInjectionContext
} from '@nano_kit/svelte'

export interface HydrationContextParams {
  /**
   * Create hydration context from an existing dehydration context reference.
   */
  fromRef?: ValueOrAccessor<number>
  /**
   * Dehydrated data as an array of key-value pairs.
   * Pass a falsy value to skip hydration.
   */
  dehydrated?: ValueOrAccessor<[string, unknown][] | FalsyValue>
  /**
   * Additional injection providers to merge into the child context.
   */
  context?: InjectionProvider[]
  /**
   * Whether to reuse an existing InjectionContext or create a new one.
   * `true` by default.
   */
  reuse?: boolean
}

/**
 * Provide hydrated data to child components using a active hydrator.
 * @param params - Hydration context parameters.
 */
export function setHydrationContext(
  {
    dehydrated,
    context = [],
    reuse = true
  }: HydrationContextParams = {}
) {
  const currentContext = getInjectionContext()
  const existingHydrator = currentContext?.get(Hydrator$, true)
  const hydrator = existingHydrator || new ActiveHydrator()
  const dehydratedValue = $get(dehydrated)

  if (dehydratedValue) {
    hydrator.push!(dehydratedValue)
  }

  if (!existingHydrator || !reuse) {
    setInjectionContext([
      ...context,
      provide(Hydrator$, hydrator)
    ])
  }
}
