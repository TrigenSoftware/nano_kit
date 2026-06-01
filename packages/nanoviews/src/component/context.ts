import {
  type InjectionProvider,
  Injector,
  getInjector,
  run,
  provide,
  inject,
  isFunction
} from 'kida'

export {
  getInjector,
  run,
  provide,
  inject
}

/**
 * Run a function within the current injector.
 * @param fn - The function to run.
 * @returns The return value of the function.
 */
export function context<R>(fn: () => R): R

/**
 * Run a function within a new injector with the given values.
 * @param providers - The values to use in the injector.
 * @param fn - The function to run.
 * @returns The return value of the function.
 */
export function context<R>(providers: InjectionProvider[], fn: () => R): R

export function context<R>(providersOrFn: InjectionProvider[] | (() => R), maybeFn?: () => R) {
  const currentInjector = getInjector()
  let providers: InjectionProvider[] | undefined
  let fn: () => R

  if (isFunction(providersOrFn)) {
    fn = providersOrFn

    if (currentInjector !== undefined) {
      return fn()
    }
  } else {
    providers = providersOrFn
    fn = maybeFn!
  }

  return run(new Injector(providers, currentInjector), fn)
}

/**
 * Run a function within a new isolated context.
 * @param fn - The function to run.
 * @returns The return value of the function.
 */
export function isolate<R>(fn: () => R): R {
  return run(undefined, fn)
}
