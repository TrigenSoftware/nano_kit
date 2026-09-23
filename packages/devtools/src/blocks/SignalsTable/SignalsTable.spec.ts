import {
  describe,
  it,
  expect
} from 'vitest'
import {
  render,
  screen,
  within,
  fireEvent
} from '@nanoviews/testing-library'
import { composeStory } from '@nanoviews/storybook'
import {
  type InjectionContext,
  getContext,
  inject,
  effect,
  batch
} from '@nano_kit/store'
import { PanelStore$ } from '../../stores/panel.js'
import { RegistryStore$ } from '../../stores/registry.js'
import {
  Cart$,
  withMockApp
} from '../shared/app.mock.js'
import { SignalsTable } from './SignalsTable.js'

// The table over the application of the stories, a new one for each test, driven by hand
async function setup() {
  let context!: InjectionContext
  const Story = composeStory({
    render() {
      context = getContext()!

      return SignalsTable()
    }
  }, {
    decorators: [withMockApp()]
  })

  render(Story())

  // The records of the application come a microtask after it started
  await Promise.resolve()

  return context
}

function rowWith(text: string) {
  return screen.getByText(text).closest('tr')!
}

function groups() {
  return screen.getAllByRole('row')
    .filter(row => row.getAttribute('aria-level') === '1')
    .map(row => row.textContent)
}

describe('devtools', () => {
  describe('blocks', () => {
    describe('SignalsTable', () => {
      it('should show the nodes under the functions they were created in, and no effects', async () => {
        await setup()

        expect(groups()).toEqual([
          expect.stringContaining('User$'),
          expect.stringContaining('Cart$')
        ])
        expect(screen.getAllByRole('row').filter(row => row.getAttribute('aria-level') === '3')).toHaveLength(1)
        expect(screen.queryByText('effect')).toBeNull()
      })

      it('should show the value of a node, its state and its links', async () => {
        await setup()

        const total = within(rowWith('148'))

        expect(total.getByText('computed')).toBeDefined()
        expect(total.getByText('active')).toBeDefined()
        expect(total.getAllByText('1')).toHaveLength(2)
        expect(screen.getByText('unevaluated')).toBeDefined()
        expect(screen.getByText('unmounted')).toBeDefined()
        expect(screen.getByText('detached')).toBeDefined()
        // The user and the name taken from it
        expect(screen.getAllByText('mounted')).toHaveLength(2)
      })

      it('should bring a row up to date after the application moved on', async () => {
        const context = await setup()

        inject(Cart$, context).tick()

        expect(screen.queryByText('237')).toBeNull()

        await Promise.resolve()

        expect(within(rowWith('237')).getByText('computed')).toBeDefined()
        // The titles were read by hand once and by no effect
        expect(screen.getByText('dirty')).toBeDefined()
      })

      it('should keep the rows whose value matches the filter', async () => {
        const context = await setup()

        inject(PanelStore$, context).$filter('dan')

        // The user and the name taken from it
        expect(screen.getAllByRole('row').filter(row => Number(row.getAttribute('aria-level')) > 1)).toHaveLength(2)
        expect(groups()).toEqual([expect.stringContaining('User$')])
      })

      it('should count the effects among the subscribers and let them go when they stop', async () => {
        const context = await setup()
        const { $total } = inject(Cart$, context)
        const total = within(rowWith('148'))
        // One more reader of the total next to the cart
        const stop = effect(() => {
          $total()
        })

        await Promise.resolve()

        expect(total.getByText('2')).toBeDefined()

        stop()

        await Promise.resolve()

        // One dependency and one reader again, the cart
        expect(total.getAllByText('1')).toHaveLength(2)
      })

      it('should drop the row of a record that left a group that stays', async () => {
        const context = await setup()
        const {
          records,
          idOf
        } = inject(RegistryStore$, context)

        // The way the registry lets go of a node that was collected: inside a batch
        batch(() => {
          records.delete(idOf(inject(Cart$, context).$coupon.node)!)
        })

        expect(screen.queryByText('unmounted')).toBeNull()
        expect(groups()).toContainEqual(expect.stringContaining('Cart$'))
      })

      it('should select the row that was clicked', async () => {
        await setup()

        const row = rowWith('148')

        fireEvent.click(row)

        expect(row.getAttribute('aria-selected')).toBe('true')

        fireEvent.click(rowWith('unmounted'))

        expect(row.getAttribute('aria-selected')).not.toBe('true')
      })

      it('should fold the rows of a group', async () => {
        await setup()

        fireEvent.click(screen.getByRole('button', {
          name: 'Cart$'
        }))

        expect(screen.queryByText('148')).toBeNull()
        // The other groups stay as they were
        expect(screen.getByText('"Dan"')).toBeDefined()
      })
    })
  })
})
