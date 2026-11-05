import { $get } from '@nano_kit/store'

export function memo<T, K>(fn: (key: K) => T): (key: K) => T {
  let key: K
  let value: T

  return (newKey) => {
    if (newKey !== key) {
      value = fn(newKey)
      key = newKey
    }

    return value
  }
}

export function read(arg: unknown) {
  // Only a plain object holds values of a call: a date or another instance is the value itself
  if ((arg as object | undefined)?.constructor !== Object) {
    return $get(arg)
  }

  const values: Record<string, unknown> = {}

  for (const key in arg as Record<string, unknown>) {
    values[key] = $get((arg as Record<string, unknown>)[key])
  }

  return values
}
