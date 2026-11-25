import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest'
import {
  cleanup,
  render
} from '@testing-library/svelte'
import {
  hydratable,
  inject,
  provide,
  signal
} from '@nano_kit/store'
import { resetRequestEvent } from '../test/app-server.js'
import {
  OtherValue$,
  Value$
} from '../test/request-values.js'
import ServerHydrationFixture from '../test/ServerHydrationFixture.svelte'
import {
  dehydrate,
  getDehydrationContext,
  isFlight,
  setDehydrationContext
} from './dehydration.js'

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

    describe('setDehydrationContext', () => {
      it('should merge providers into request context and override existing values', () => {
        setDehydrationContext([
          provide(Value$, 'first')
        ])
        setDehydrationContext([
          provide(Value$, 'second'),
          provide(OtherValue$, 'added')
        ])

        const context = getDehydrationContext()

        expect(context.get(Value$)).toBe('second')
        expect(context.get(OtherValue$)).toBe('added')
      })
    })

    describe('dehydrate', () => {
      it('should dehydrate stores', async () => {
        const dehydrated = await dehydrate(() => [
          hydratable('count', signal(42))
        ])

        expect(dehydrated).toEqual([['count', 42]])
      })

      it('should run stores in the request context', async () => {
        setDehydrationContext([
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
    })

    describe('isFlight', () => {
      it('should detect a data request as a flight request', () => {
        resetRequestEvent('/', true)

        expect(isFlight()).toBe(true)
      })

      it('should not treat a document request as a flight request', () => {
        expect(isFlight()).toBe(false)
      })
    })

    describe('setHydrationContext', () => {
      afterEach(cleanup)

      it('should render the root in the context of the request', () => {
        setDehydrationContext([
          provide(Value$, 'from the load')
        ])

        const { container } = render(ServerHydrationFixture)

        expect(container.textContent).toBe('from the load other')
      })

      it('should merge the given providers into the context of the request', () => {
        render(ServerHydrationFixture, {
          props: {
            providers: [
              provide(OtherValue$, 'from the layout')
            ]
          }
        })

        expect(getDehydrationContext().get(OtherValue$)).toBe('from the layout')
      })

      it('should not carry the context of a request into the next one', () => {
        setDehydrationContext([
          provide(Value$, 'from the previous request')
        ])
        resetRequestEvent()

        const { container } = render(ServerHydrationFixture)

        expect(container.textContent).toBe('default other')
      })
    })
  })
})
