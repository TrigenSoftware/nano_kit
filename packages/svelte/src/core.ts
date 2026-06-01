import {
  type NewValue,
  type Destroy,
  type InjectionToken,
  type InjectionProvider,
  type ObserverCallback,
  type ReadableSignal,
  type WritableSignal,
  Injector,
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
  getSvelteInjector,
  setSvelteInjector
] = createContext<Injector>()

/**
 * Get the current injector.
 * @returns The current injector.
 */
export function getInjector() {
  try {
    return getSvelteInjector()
  } catch {
    return undefined
  }
}

/**
 * Provide dependencies.
 * @param injector - The dependencies to provide or Injector instance.
 * @returns The injector.
 */
export function setInjector(
  injector?: Injector | InjectionProvider[]
) {
  const parent = getInjector()
  const value = injector instanceof Injector
    ? injector
    : new Injector(injector, parent)

  return setSvelteInjector(value)
}

/**
 * Isolate to new isolated injector.
 * @returns The injector.
 */
export function isolate() {
  return setSvelteInjector(new Injector())
}

/**
 * Inject a dependency.
 * @param token - The invocable token to create or get the dependency.
 * @returns The dependency.
 */
export function getInject<T>(token: InjectionToken<T>): T {
  return inject(token, getInjector())
}
