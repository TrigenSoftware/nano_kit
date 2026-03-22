import {
  describe,
  it,
  expect
} from 'vitest'
import { render } from '@testing-library/react'
import {
  signal,
  hydratable,
  inject
} from '@nano_kit/store'
import {
  InjectionContextProvider,
  useInject,
  useSignal
} from './core.js'
import {
  flightDehydrate,
  DehydrationProvider,
  InitialDehydrationProvider
} from './dehydration.js'

function Value$() {
  return hydratable('value', signal<string | null>(null))
}

function Test() {
  const $value = useInject(Value$)
  const value = useSignal($value)

  return (
    <div>
      {value ?? 'empty'}
    </div>
  )
}

describe('react', () => {
  describe('dehydration', () => {
    describe('flightDehydrate', () => {
      it('should dehydrate stores', async () => {
        const dehydrated = await flightDehydrate(() => [
          hydratable('count', signal(42))
        ])

        expect(dehydrated).toEqual([['count', 42]])
      })
    })

    describe('DehydrationProvider', () => {
      it('should hydrate children with pre-dehydrated data', async () => {
        const jsx = await DehydrationProvider({
          stores: () => [],
          dehydrated: [['value', 'hello']],
          children: (
            <InjectionContextProvider>
              <Test/>
            </InjectionContextProvider>
          )
        })
        const { container } = render(jsx)

        expect(container.innerHTML).toBe('<div>hello</div>')
      })

      it('should dehydrate stores and hydrate children', async () => {
        const jsx = await DehydrationProvider({
          stores: () => {
            const $value = inject(Value$)

            $value('from-stores')

            return [$value]
          },
          children: (
            <InjectionContextProvider>
              <Test/>
            </InjectionContextProvider>
          )
        })
        const { container } = render(jsx)

        expect(container.innerHTML).toBe('<div>from-stores</div>')
      })
    })

    describe('InitialDehydrationProvider', () => {
      it('should hydrate children when not flight', async () => {
        const jsx = await InitialDehydrationProvider({
          stores: () => [],
          flight: false,
          dehydrated: [['value', 'hello']],
          children: (
            <InjectionContextProvider>
              <Test/>
            </InjectionContextProvider>
          )
        })
        const { container } = render(jsx)

        expect(container.innerHTML).toBe('<div>hello</div>')
      })

      it('should dehydrate stores when not flight and no pre-dehydrated data', async () => {
        const jsx = await InitialDehydrationProvider({
          stores: () => {
            const $value = inject(Value$)

            $value('from-stores')

            return [$value]
          },
          flight: false,
          children: (
            <InjectionContextProvider>
              <Test/>
            </InjectionContextProvider>
          )
        })
        const { container } = render(jsx)

        expect(container.innerHTML).toBe('<div>from-stores</div>')
      })

      it('should skip hydration when flight', async () => {
        const jsx = await InitialDehydrationProvider({
          stores: () => [],
          flight: true,
          dehydrated: [['value', 'hello']],
          children: (
            <InjectionContextProvider>
              <Test/>
            </InjectionContextProvider>
          )
        })
        const { container } = render(jsx)

        expect(container.innerHTML).toBe('<div>empty</div>')
      })
    })
  })
})
