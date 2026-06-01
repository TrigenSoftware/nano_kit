/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  type AnyFn,
  untracked
} from 'agera'

export type InjectionToken<T = unknown> = {
  (): T
  injectable?: false
} | {
  new (): T
  injectable: true
}

export type InjectionProvider = readonly [InjectionToken, unknown]

/**
 * Injector is a Map that holds dependencies for the current injector scope.
 */
export class Injector extends Map<InjectionToken, unknown> {
  readonly #parent

  constructor(
    providers?: InjectionProvider[],
    parent?: Injector
  ) {
    super()

    this.#parent = parent

    if (providers) {
      for (let i = 0, len = providers.length, entity; i < len; i++) {
        entity = providers[i]
        this.set(entity[0], entity[1])
      }
    }
  }

  override get<T>(Injectable: InjectionToken<T>): T

  override get<T>(Injectable: InjectionToken<T>, find: true): T | undefined

  override get<T>(Injectable: InjectionToken<T>, find?: boolean): T | undefined {
    if (this.has(Injectable)) {
      return super.get(Injectable) as T
    }

    let value = this.#parent?.get(Injectable, true)

    if (!find) {
      this.set(Injectable, value ??= run(this, Injectable.injectable ? () => new Injectable() : Injectable))
    }

    return value
  }
}

let currentInjector: Injector | undefined

/**
 * Get the current injector.
 * @returns The current injector.
 */
/* @__NO_SIDE_EFFECTS__ */
export function getInjector() {
  return currentInjector
}

/**
 * Run a function within an injector.
 * @param injector - The injector.
 * @param fn - The function to run.
 * @param args - The arguments to pass to the function.
 * @returns The return value of the function.
 */
export function run<T extends AnyFn>(
  injector: Injector | undefined,
  fn: T,
  ...args: Parameters<T>
): ReturnType<T> {
  const parentInjector = currentInjector

  currentInjector = injector

  try {
    return untracked(() => fn(...args as unknown[]))
  } finally {
    currentInjector = parentInjector
  }
}

/**
 * Provide a dependency.
 * @param token - The invocable token to create or get the dependency.
 * @param value - The value of the dependency.
 * @returns The provider.
 */
/* @__NO_SIDE_EFFECTS__ */
export function provide<T>(token: InjectionToken<T>, value: T): InjectionProvider {
  return [token, value]
}

/**
 * Inject a dependency.
 * @param token - The invocable token to create or get the dependency.
 * @param injector - Optional injector override.
 * @returns The dependency.
 */
export function inject<T>(token: InjectionToken<T>, injector = currentInjector): T {
  if (!injector) {
    throw new Error('Cannot inject dependency outside of injector')
  }

  return injector.get(token)
}

export class DependencyNotFound extends Error {
  constructor(caller: string) {
    super(`${caller} dependency not found in injector.`)
  }
}

/**
 * Base class for class-based injectables.
 */
export class Injectable {
  static injectable = true as const
}
