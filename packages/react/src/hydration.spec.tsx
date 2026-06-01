import {
  describe,
  it,
  expect
} from 'vitest'
import {
  render,
  act
} from '@testing-library/react'
import {
  signal,
  hydratable
} from '@nano_kit/store'
import {
  InjectorProvider,
  useInject,
  useSignal
} from './core.js'
import {
  HydrationProvider,
  StaticHydrationProvider
} from './hydration.js'

function Signal$() {
  return hydratable('value', signal<string | null>(null))
}

function Test() {
  const $value = useInject(Signal$)
  const value = useSignal($value)

  return (
    <div>
      {value ?? 'empty'}
    </div>
  )
}

describe('react', () => {
  describe('hydration', () => {
    describe('HydrationProvider', () => {
      it('should hydrate on mount', () => {
        const { container } = render(
          <InjectorProvider>
            <HydrationProvider dehydrated={[['value', 'hello']]}>
              <Test/>
            </HydrationProvider>
          </InjectorProvider>
        )

        expect(container.innerHTML).toBe('<div>hello</div>')
      })

      it('should re-hydrate when dehydrated prop changes', () => {
        const { container, rerender } = render(
          <InjectorProvider>
            <HydrationProvider dehydrated={[['value', 'first']]}>
              <Test/>
            </HydrationProvider>
          </InjectorProvider>
        )

        expect(container.innerHTML).toBe('<div>first</div>')

        act(() => {
          rerender(
            <InjectorProvider>
              <HydrationProvider dehydrated={[['value', 'second']]}>
                <Test/>
              </HydrationProvider>
            </InjectorProvider>
          )
        })

        expect(container.innerHTML).toBe('<div>second</div>')
      })

      it('should skip hydration when dehydrated is falsy', () => {
        const { container } = render(
          <InjectorProvider>
            <HydrationProvider dehydrated={null}>
              <Test/>
            </HydrationProvider>
          </InjectorProvider>
        )

        expect(container.innerHTML).toBe('<div>empty</div>')
      })
    })

    describe('StaticHydrationProvider', () => {
      it('should hydrate on mount', () => {
        const { container } = render(
          <InjectorProvider>
            <StaticHydrationProvider dehydrated={[['value', 'hello']]}>
              <Test/>
            </StaticHydrationProvider>
          </InjectorProvider>
        )

        expect(container.innerHTML).toBe('<div>hello</div>')
      })

      it('should not re-hydrate on re-render', () => {
        const { container, rerender } = render(
          <InjectorProvider>
            <StaticHydrationProvider dehydrated={[['value', 'first']]}>
              <Test/>
            </StaticHydrationProvider>
          </InjectorProvider>
        )

        expect(container.innerHTML).toBe('<div>first</div>')

        act(() => {
          rerender(
            <InjectorProvider>
              <StaticHydrationProvider dehydrated={[['value', 'second']]}>
                <Test/>
              </StaticHydrationProvider>
            </InjectorProvider>
          )
        })

        expect(container.innerHTML).toBe('<div>first</div>')
      })

      it('should skip hydration when dehydrated is falsy', () => {
        const { container } = render(
          <InjectorProvider>
            <StaticHydrationProvider dehydrated={null}>
              <Test/>
            </StaticHydrationProvider>
          </InjectorProvider>
        )

        expect(container.innerHTML).toBe('<div>empty</div>')
      })
    })
  })
})
