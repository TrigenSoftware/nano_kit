import {
  beforeEach,
  describe,
  expect,
  it
} from 'vitest'
import {
  hydratable,
  inject,
  provide,
  signal
} from '@nano_kit/store'
import { resetRequestEvent } from '../test/app-server.js'
import {
  dehydrate,
  getDehydrationInjector,
  isFlight,
  setDehydrationInjector
} from './dehydration.js'

function Value$() {
  return 'default'
}

function OtherValue$() {
  return 'other'
}

function Count$() {
  return signal(1)
}

function HydratableCount$() {
  return hydratable('count', signal(1))
}

describe('svelte-kit', () => {
  describe('dehydration', () => {
    beforeEach(() => {
      resetRequestEvent()
    })

    describe('setDehydrationInjector', () => {
      it('should merge providers into request injector and override existing values', () => {
        setDehydrationInjector([
          provide(Value$, 'first')
        ])
        setDehydrationInjector([
          provide(Value$, 'second'),
          provide(OtherValue$, 'added')
        ])

        const injector = getDehydrationInjector()

        expect(injector.get(Value$)).toBe('second')
        expect(injector.get(OtherValue$)).toBe('added')
      })
    })

    describe('dehydrate', () => {
      it('should dehydrate stores', async () => {
        const dehydrated = await dehydrate(() => [
          hydratable('count', signal(42))
        ])

        expect(dehydrated).toEqual([['count', 42]])
      })

      it('should run stores in the request injector', async () => {
        setDehydrationInjector([
          provide(Count$, signal(41))
        ])

        const dehydrated = await dehydrate(() => {
          const $count = hydratable('count', inject(Count$))

          $count(42)

          return [$count]
        })

        expect(dehydrated).toEqual([['count', 42]])
      })

      it('should dehydrate each request-scoped store once', async () => {
        const first = await dehydrate(() => [
          inject(HydratableCount$)
        ])
        const second = await dehydrate(() => [
          inject(HydratableCount$)
        ])

        expect(first).toEqual([['count', 1]])
        expect(second).toEqual([])
      })

      it('should detect data requests as flight requests', () => {
        resetRequestEvent('application/json')

        expect(isFlight()).toBe(true)
      })
    })
  })
})
