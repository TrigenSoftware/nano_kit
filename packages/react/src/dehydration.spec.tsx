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
  serverDehydrate,
  Dehydration,
  StaticDehydration
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
    describe('serverDehydrate', () => {
      it('should dehydrate stores', async () => {
        const dehydrated = await serverDehydrate(() => [
          hydratable('count', signal(42))
        ])

        expect(dehydrated).toEqual([['count', 42]])
      })
    })

    describe('Dehydration', () => {
      it('should hydrate children with pre-dehydrated data', async () => {
        const jsx = await Dehydration({
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
        const jsx = await Dehydration({
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

    describe('InitialDehydration', () => {
      it('should hydrate children when not flight', async () => {
        const jsx = await StaticDehydration({
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
        const jsx = await StaticDehydration({
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
        const jsx = await StaticDehydration({
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
