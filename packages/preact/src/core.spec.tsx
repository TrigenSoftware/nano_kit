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
  type ReadableSignal,
  signal,
  provide
} from '@nano_kit/store'
import {
  useSignal,
  InjectorProvider,
  useInject
} from './core.js'

describe('preact', () => {
  describe('core', () => {
    describe('useSignal', () => {
      it('should use signal store', () => {
        const $count = signal(0)

        function Test() {
          const count = useSignal($count)

          return (
            <div>
              {count}
            </div>
          )
        }

        const { container } = render(
          <Test/>
        )

        expect(container.innerHTML).toBe('<div>0</div>')

        act(() => $count(1))

        expect(container.innerHTML).toBe('<div>1</div>')
      })
    })

    describe('Injector', () => {
      it('should provide dependency', () => {
        const $count = signal(0)

        function Token$(): ReadableSignal<number> | null {
          return null
        }

        function Test() {
          const $count = useInject(Token$)!
          const count = useSignal($count)

          return (
            <div>
              {count}
            </div>
          )
        }

        const { container } = render(
          <InjectorProvider
            injector={[provide(Token$, $count)]}
          >
            <Test/>
          </InjectorProvider>
        )

        expect(container.innerHTML).toBe('<div>0</div>')

        act(() => $count(1))

        expect(container.innerHTML).toBe('<div>1</div>')
      })
    })

    describe('useInject', () => {
      it('should inject dependency', () => {
        const $count = signal(0)

        function Token$() {
          return $count
        }

        function Test() {
          const $count = useInject(Token$)
          const count = useSignal($count)

          return (
            <div>
              {count}
            </div>
          )
        }

        const { container } = render(
          <InjectorProvider>
            <Test/>
          </InjectorProvider>
        )

        expect(container.innerHTML).toBe('<div>0</div>')

        act(() => $count(1))

        expect(container.innerHTML).toBe('<div>1</div>')
      })
    })
  })
})
