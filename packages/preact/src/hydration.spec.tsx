import {
  describe,
  it,
  expect
} from 'vitest'
import {
  render,
  act
} from '@testing-library/preact'
import {
  type InjectionContext,
  signal,
  hydratable
} from '@nano_kit/store'
import {
  InjectionContextProvider,
  useInjectionContext,
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

function Context({ contexts }: { contexts: (InjectionContext | undefined)[] }) {
  contexts.push(useInjectionContext())

  return null
}

describe('preact', () => {
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

      it('should reuse the parent hydration context by default', () => {
        const contexts: (InjectionContext | undefined)[] = []

        render(
          <InjectionContextProvider>
            <HydrationProvider>
              <Context contexts={contexts}/>
              <HydrationProvider>
                <Context contexts={contexts}/>
              </HydrationProvider>
            </HydrationProvider>
          </InjectionContextProvider>
        )

        expect(contexts[1]).toBe(contexts[0])
      })

      it('should create a child context when reuse is disabled', () => {
        const contexts: (InjectionContext | undefined)[] = []

        render(
          <InjectionContextProvider>
            <HydrationProvider>
              <Context contexts={contexts}/>
              <HydrationProvider reuse={false}>
                <Context contexts={contexts}/>
              </HydrationProvider>
            </HydrationProvider>
          </InjectionContextProvider>
        )

        expect(contexts[1]).not.toBe(contexts[0])
      })
    })

    describe('StaticHydrationProvider', () => {
      it('should hydrate on mount', () => {
        const { container } = render(
          <InjectionContextProvider>
            <StaticHydrationProvider dehydrated={[['value', 'hello']]}>
              <Test/>
            </StaticHydrationProvider>
          </InjectionContextProvider>
        )

        expect(container.innerHTML).toBe('<div>hello</div>')
      })

      it('should not re-hydrate on re-render', () => {
        const { container, rerender } = render(
          <InjectionContextProvider>
            <StaticHydrationProvider dehydrated={[['value', 'first']]}>
              <Test/>
            </StaticHydrationProvider>
          </InjectionContextProvider>
        )

        expect(container.innerHTML).toBe('<div>first</div>')

        act(() => {
          rerender(
            <InjectionContextProvider>
              <StaticHydrationProvider dehydrated={[['value', 'second']]}>
                <Test/>
              </StaticHydrationProvider>
            </InjectionContextProvider>
          )
        })

        expect(container.innerHTML).toBe('<div>first</div>')
      })

      it('should skip hydration when dehydrated is falsy', () => {
        const { container } = render(
          <InjectionContextProvider>
            <StaticHydrationProvider dehydrated={null}>
              <Test/>
            </StaticHydrationProvider>
          </InjectionContextProvider>
        )

        expect(container.innerHTML).toBe('<div>empty</div>')
      })
    })
  })
})
