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
