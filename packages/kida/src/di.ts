/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  type AnyFn,
  untracked
} from 'agera'

export type InjectionFactory<T = unknown> = () => T

export type InjectionProvider = readonly [InjectionFactory, unknown]

/**
 * InjectionContext is a Map that holds the dependencies for the current context.
 */
export class InjectionContext extends Map<InjectionFactory, unknown> {
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

  override get<T>(factory: InjectionFactory<T>, ctx = this): T {
    if (this.has(factory)) {
      return super.get(factory) as T
    }

    const parent = this.#parent
    const value = parent
      ? parent.get(factory, ctx)
      : run(ctx, factory)

    this.set(factory, value)

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
 * @param token - The factory function to create or get the dependency.
 * @param value - The value of the dependency.
 * @returns The provider.
 */
/* @__NO_SIDE_EFFECTS__ */
export function provide<T>(token: InjectionFactory<T>, value: T): InjectionProvider {
  return [token, value]
}

/**
 * Inject a dependency.
 * @param factory - The factory function to create or get the dependency.
 * @param context - Optional override for the injection context.
 * @returns The dependency.
 */
export function inject<T>(factory: InjectionFactory<T>, context = currentContext): T {
  if (!context) {
    throw new Error('Cannot inject dependency outside of injection context')
  }

  return context.get(factory)
}

export class DependencyNotFound extends Error {
  constructor(caller: string) {
    super(`${caller} dependency not found in context.`)
  }
}
