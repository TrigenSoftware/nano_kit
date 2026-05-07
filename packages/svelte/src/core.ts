import {
  type NewValue,
  type Destroy,
  type InjectionFactory,
  type InjectionProvider,
  type ObserverCallback,
  type ReadableSignal,
  type WritableSignal,
  InjectionContext,
  inject,
  isWritable,
  onSignal,
  subscribe as storeSubscribe
} from '@nano_kit/store'
import { createContext } from 'svelte'

declare module '@nano_kit/store' {
  interface ReadableSignal<T> {
    subscribe(subscription: ObserverCallback<T>): Destroy
  }

  interface WritableSignal<T> {
    set(value: NewValue<T>): void
  }
}

function subscribe<T>(
  this: ReadableSignal<T>,
  subscription: ObserverCallback<T>
) {
  return storeSubscribe(this, subscription)
}

function set<T>(
  this: WritableSignal<T>,
  value: NewValue<T>
) {
  this(value)
}

onSignal(($signal) => {
  $signal.subscribe = subscribe

  if (isWritable($signal)) {
    $signal.set = set
  }
})

const [
  getInjectionContext,
  setSvelteInjectionContext
] = createContext<InjectionContext>()

/**
 * Get the current injection context.
 * @returns The current injection context.
 */
export { getInjectionContext }

function getParentInjectionContext() {
  try {
    return getInjectionContext()
  } catch {
    return undefined
  }
}

/**
 * Provide dependencies.
 * @param context - The dependencies to provide or InjectionContext instance.
 * @returns The injection context.
 */
export function setInjectionContext(
  context?: InjectionContext | InjectionProvider[]
) {
  const parent = getParentInjectionContext()
  const value = context instanceof InjectionContext
    ? context
    : new InjectionContext(context, parent)

  return setSvelteInjectionContext(value)
}

/**
 * Isolate to new isolated injection context.
 * @returns The injection context.
 */
export function isolate() {
  return setSvelteInjectionContext(new InjectionContext())
}

/**
 * Inject a dependency.
 * @param factory - The factory function to create or get the dependency.
 * @returns The dependency.
 */
export function getInject<T>(factory: InjectionFactory<T>): T {
  return inject(factory, getParentInjectionContext())
}
