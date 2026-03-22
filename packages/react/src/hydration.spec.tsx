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
  InjectionContextProvider,
  useInject,
  useSignal
} from './core.js'
import {
  HydrationProvider,
  InitialHydrationProvider
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
          <InjectionContextProvider>
            <HydrationProvider dehydrated={[['value', 'hello']]}>
              <Test/>
            </HydrationProvider>
          </InjectionContextProvider>
        )

        expect(container.innerHTML).toBe('<div>hello</div>')
      })

      it('should re-hydrate when dehydrated prop changes', () => {
        const { container, rerender } = render(
          <InjectionContextProvider>
            <HydrationProvider dehydrated={[['value', 'first']]}>
              <Test/>
            </HydrationProvider>
          </InjectionContextProvider>
        )

        expect(container.innerHTML).toBe('<div>first</div>')

        act(() => {
          rerender(
            <InjectionContextProvider>
              <HydrationProvider dehydrated={[['value', 'second']]}>
                <Test/>
              </HydrationProvider>
            </InjectionContextProvider>
          )
        })

        expect(container.innerHTML).toBe('<div>second</div>')
      })

      it('should skip hydration when dehydrated is falsy', () => {
        const { container } = render(
          <InjectionContextProvider>
            <HydrationProvider dehydrated={null}>
              <Test/>
            </HydrationProvider>
          </InjectionContextProvider>
        )

        expect(container.innerHTML).toBe('<div>empty</div>')
      })
    })

    describe('InitialHydrationProvider', () => {
      it('should hydrate on mount', () => {
        const { container } = render(
          <InjectionContextProvider>
            <InitialHydrationProvider dehydrated={[['value', 'hello']]}>
              <Test/>
            </InitialHydrationProvider>
          </InjectionContextProvider>
        )

        expect(container.innerHTML).toBe('<div>hello</div>')
      })

      it('should not re-hydrate on re-render', () => {
        const { container, rerender } = render(
          <InjectionContextProvider>
            <InitialHydrationProvider dehydrated={[['value', 'first']]}>
              <Test/>
            </InitialHydrationProvider>
          </InjectionContextProvider>
        )

        expect(container.innerHTML).toBe('<div>first</div>')

        act(() => {
          rerender(
            <InjectionContextProvider>
              <InitialHydrationProvider dehydrated={[['value', 'second']]}>
                <Test/>
              </InitialHydrationProvider>
            </InjectionContextProvider>
          )
        })

        expect(container.innerHTML).toBe('<div>first</div>')
      })

      it('should skip hydration when dehydrated is falsy', () => {
        const { container } = render(
          <InjectionContextProvider>
            <InitialHydrationProvider dehydrated={null}>
              <Test/>
            </InitialHydrationProvider>
          </InjectionContextProvider>
        )

        expect(container.innerHTML).toBe('<div>empty</div>')
      })
    })
  })
})
