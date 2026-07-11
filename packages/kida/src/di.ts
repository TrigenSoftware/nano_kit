/* oxlint-disable typescript/no-unsafe-return */
import {
  type AnyFn,
  untracked
} from 'agera'

export type Injectable<T = unknown> = {
  injectable?: undefined
  (): T
} | {
  injectable: true
  new (): T
}

export type InjectionProvider = readonly [Injectable, unknown]

/**
 * InjectionContext is a Map that holds dependencies for the current context.
 */
export class InjectionContext extends Map<Injectable, unknown> {
  readonly #parent

  constructor(
    providers?: InjectionProvider[],
    parent?: InjectionContext
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

  override get<T>(injectable: Injectable<T>): T

  override get<T>(injectable: Injectable<T>, find: true): T | undefined

  override get<T>(injectable: Injectable<T>, find?: boolean): T | undefined {
    if (this.has(injectable)) {
      return super.get(injectable) as T
    }

    let value = this.#parent?.get(injectable, true)

    if (!find) {
      // oxlint-disable-next-line eslint/new-cap
      this.set(injectable, value ??= run(this, injectable.injectable ? () => new injectable() : injectable))
    }

    return value
  }
}

let currentContext: InjectionContext | undefined

/**
 * Get current injection context.
 * @returns The current injection context.
 */
/* @__NO_SIDE_EFFECTS__ */
export function getContext() {
  return currentContext
}

/**
 * Run a function within an injection context.
 * @param context - The injection context.
 * @param fn - The function to run.
 * @param args - The arguments to pass to the function.
 * @returns The return value of the function.
 */
export function run<T extends AnyFn>(
  context: InjectionContext | undefined,
  fn: T,
  ...args: Parameters<T>
): ReturnType<T> {
  const parentContext = currentContext

  currentContext = context

  try {
    return untracked(() => fn(...args as unknown[]))
  } finally {
    currentContext = parentContext
  }
}

/**
 * Provide a dependency.
 * @param injectable - The injectable function or class to associate with the value.
 * @param value - The value of the dependency.
 * @returns The provider.
 */
/* @__NO_SIDE_EFFECTS__ */
export function provide<T>(injectable: Injectable<T>, value: T): InjectionProvider {
  return [injectable, value]
}

/**
 * Inject a dependency.
 * @param injectable - The injectable function or class to create or get the dependency.
 * @param context - Optional override for the injection context.
 * @returns The dependency.
 */
export function inject<T>(injectable: Injectable<T>, context = currentContext): T {
  if (!context) {
    throw new Error('Cannot inject dependency outside of injection context')
  }

  return context.get(injectable)
}

export class DependencyNotFound extends Error {
  constructor(caller: string) {
    super(`${caller} dependency not found in context.`)
  }
}

/**
 * Base class for class-based injectables.
 */
export class Injectable$ {
  static injectable = true as const
}
