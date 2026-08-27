import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import {
  signal,
  computed
} from 'agera'
import { resolved } from './resolved.js'

describe('kida', () => {
  describe('resolved', () => {
    it('should resolve with the promise computed', async () => {
      const promise = Promise.resolve(42)
      const [$result, $error, $pending] = resolved(computed(() => promise))

      expect($result()).toBeUndefined()
      expect($error()).toBeUndefined()
      expect($pending()).toBe(true)

      await promise

      expect($result()).toBe(42)
      expect($error()).toBeUndefined()
      expect($pending()).toBe(false)
    })

    it('should resolve with the promise accessor', async () => {
      let promise!: Promise<number>
      const accessor = vi.fn(() => promise = Promise.resolve(42))
      const [$result, $error, $pending] = resolved(accessor)

      expect($result()).toBeUndefined()
      expect($error()).toBeUndefined()
      expect($pending()).toBe(true)

      await promise

      expect($result()).toBe(42)
      expect($error()).toBeUndefined()
      expect($pending()).toBe(false)
      expect(accessor).toHaveBeenCalledTimes(1)
    })

    it('should resolve with the direct promise', async () => {
      const promise = Promise.resolve(42)
      const [$result, $error, $pending] = resolved(promise)

      expect($result()).toBeUndefined()
      expect($error()).toBeUndefined()
      expect($pending()).toBe(true)

      await promise

      expect($result()).toBe(42)
      expect($error()).toBeUndefined()
      expect($pending()).toBe(false)
    })

    it('should not call the accessor until the first read', () => {
      const accessor = vi.fn(() => Promise.resolve(42))
      const [, , $pending] = resolved(accessor)

      expect(accessor).not.toHaveBeenCalled()
      expect($pending()).toBe(true)
      expect(accessor).toHaveBeenCalledTimes(1)
    })

    it('should resolve with the static value', () => {
      const [$result, $error, $pending] = resolved(42)

      expect($result()).toBe(42)
      expect($error()).toBeUndefined()
      expect($pending()).toBe(false)
    })

    it('should resolve with the static accessor', () => {
      const [$result, $error, $pending] = resolved(() => 42)

      expect($result()).toBe(42)
      expect($error()).toBeUndefined()
      expect($pending()).toBe(false)
    })

    it('should capture rejection errors', async () => {
      const error = new Error('test error')
      const promise = Promise.reject(error)
      const [$result, $error, $pending] = resolved(computed(() => promise))

      expect($result()).toBeUndefined()
      expect($error()).toBeUndefined()
      expect($pending()).toBe(true)

      try {
        await promise
      } catch {}

      expect($result()).toBeUndefined()
      expect($error()).toBe(error)
      expect($pending()).toBe(false)
    })

    it('should react to source signal changes', async () => {
      let promise: Promise<number> | null = null
      const $promise = signal<number | Promise<number> | null>(promise)
      const [$result, , $pending] = resolved($promise)

      expect($result()).toBeUndefined()
      expect($pending()).toBe(false)

      promise = Promise.resolve(1)
      $promise(promise)

      expect($result()).toBeUndefined()
      expect($pending()).toBe(true)

      await promise

      expect($result()).toBe(1)
      expect($pending()).toBe(false)

      promise = Promise.resolve(2)
      $promise(promise)

      expect($result()).toBe(1)
      expect($pending()).toBe(true)

      await promise

      expect($result()).toBe(2)
      expect($pending()).toBe(false)

      $promise(null)

      expect($result()).toBeUndefined()
      expect($pending()).toBe(false)

      $promise(42)

      expect($result()).toBe(42)
      expect($pending()).toBe(false)
    })

    it('should ignore previous promise results when source changes', async () => {
      const $promise = signal<Promise<number> | null>(null)
      const [$result, , $pending] = resolved($promise)
      const longPromise = new Promise<number>(resolve => setTimeout(() => resolve(1), 100))
      const quickPromise = new Promise<number>(resolve => setTimeout(() => resolve(2), 50))

      $promise(longPromise)

      expect($result()).toBeUndefined()
      expect($pending()).toBe(true)

      $promise(quickPromise)

      expect($result()).toBeUndefined()
      expect($pending()).toBe(true)

      await quickPromise

      expect($result()).toBe(2)
      expect($pending()).toBe(false)

      await longPromise

      expect($result()).toBe(2)
      expect($pending()).toBe(false)
    })
  })
})
