/* @__NO_SIDE_EFFECTS__ */
export function addFn<
  // oxlint-disable-next-line typescript/no-explicit-any
  T extends (...args: any[]) => void
>(prevFn: T | undefined, fn: T): T {
  if (prevFn === undefined) {
    return fn
  }

  return function (this: unknown, ...args: Parameters<T>) {
    prevFn.apply(this, args)
    fn.apply(this, args)
  } as T
}

export function settle<T, R>(
  promise: Promise<T>,
  onSettled: (data: T | undefined, error?: unknown) => R
) {
  return promise.then(
    onSettled,
    error => onSettled(undefined, error)
  )
}
