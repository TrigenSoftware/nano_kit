import {
  useCallback,
  useRef
} from 'react'
import { type AnyFn } from '@nano_kit/store'

/**
 * Create a stable event callback that always calls the latest version of the provided function.
 * @param fn - The function to create a stable callback for
 * @returns A stable callback function that calls the latest version of `fn`
 */
export function useEventCallback<T extends AnyFn>(fn: T): T {
  const ref = useRef(fn)

  ref.current = fn

  return useCallback(((...args) => ref.current(...args)) as T, [])
}
