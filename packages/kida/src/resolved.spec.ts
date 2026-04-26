import {
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
    it('should resolve with the promise value', async () => {
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
