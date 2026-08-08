import {
  type InjectionProvider,
  InjectionContext,
  getContext,
  run,
  unsafeRun,
  provide,
  inject,
  isFunction
} from 'kida'

export {
  getContext,
  run,
  provide,
  inject
}

/**
 * Run a function within an current injection context.
 * @param fn - The function to run.
 * @returns The return value of the function.
 */
export function context<R>(fn: () => R): R

/**
 * Run a function within a new injection context with the given values.
 * @param providers - The values to use in the context.
 * @param fn - The function to run.
 * @returns The return value of the function.
 */
export function context<R>(providers: InjectionProvider[], fn: () => R): R

export function context<R>(providersOrFn: InjectionProvider[] | (() => R), maybeFn?: () => R) {
  const currentContext = getContext()
  let providers: InjectionProvider[] | undefined
  let fn: () => R

  if (isFunction(providersOrFn)) {
    fn = providersOrFn

    if (currentContext !== undefined) {
      return fn()
    }
  } else {
    providers = providersOrFn
    fn = maybeFn!
  }

  return unsafeRun(new InjectionContext(providers, currentContext), fn)
}

/**
 * Run a function within a new isolated injection context.
 * @param fn - The function to run.
 * @returns The return value of the function.
 */
export function isolate<R>(fn: () => R): R {
  return unsafeRun(undefined, fn)
}
