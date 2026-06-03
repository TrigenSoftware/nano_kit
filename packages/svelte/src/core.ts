import {
  type NewValue,
  type Destroy,
  type Injectable,
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
  getSvelteInjectionContext,
  setSvelteInjectionContext
] = createContext<InjectionContext>()

/**
 * Get the current injection context.
 * @returns The current injection context.
 */
export function getInjectionContext() {
  try {
    return getSvelteInjectionContext()
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
  const parent = getInjectionContext()
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
 * @param injectable - The injectable function or class to create or get the dependency.
 * @returns The dependency.
 */
export function getInject<T>(injectable: Injectable<T>): T {
  return inject(injectable, getInjectionContext())
}
