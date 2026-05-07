import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest'
import {
  type ReadableSignal,
  provide,
  signal
} from '@nano_kit/store'
import {
  cleanup,
  fireEvent,
  render
} from '@testing-library/svelte'
import { tick } from 'svelte'
import './index.js'
import IsolateFixture from '../test/IsolateFixture.svelte'
import ProviderFixture from '../test/ProviderFixture.svelte'
import StoreFixture from '../test/StoreFixture.svelte'

afterEach(cleanup)

describe('svelte', () => {
  describe('core', () => {
    describe('stores', () => {
      it('should use signal store', async () => {
        const $count = signal(0)
        const { container } = render(StoreFixture, {
          props: {
            count: $count
          }
        })

        expect(container.innerHTML).toBe('<button>0</button>')

        $count(1)
        await tick()

        expect(container.innerHTML).toBe('<button>1</button>')

        await fireEvent.click(container.querySelector('button') as Element)

        expect(container.innerHTML).toBe('<button>2</button>')
        expect($count()).toBe(2)
      })
    })

    describe('InjectionContext', () => {
      it('should provide dependency', () => {
        const $count = signal(0)
        const values: unknown[] = []

        function Factory$(): ReadableSignal<number> | null {
          return null
        }

        render(ProviderFixture, {
          props: {
            context: [provide(Factory$, $count)],
            token: Factory$,
            onValue: (value: unknown) => values.push(value)
          }
        })

        expect(values).toEqual([$count])
      })

      it('should isolate dependencies from parent component context', () => {
        const $count = signal(0)
        const values: unknown[] = []

        function Factory$() {
          return signal(1)
        }

        render(IsolateFixture, {
          props: {
            context: [provide(Factory$, $count)],
            token: Factory$,
            onValue: (value: unknown) => values.push(value)
          }
        })

        expect(values).not.toEqual([$count])
        expect((values[0] as ReadableSignal<number>)()).toBe(1)
      })
    })

    describe('getInject', () => {
      it('should inject dependency', () => {
        const $count = signal(0)
        const values: unknown[] = []

        function Factory$() {
          return $count
        }

        render(ProviderFixture, {
          props: {
            context: [],
            token: Factory$,
            onValue: (value: unknown) => values.push(value)
          }
        })

        expect(values).toEqual([$count])
      })
    })
  })
})
