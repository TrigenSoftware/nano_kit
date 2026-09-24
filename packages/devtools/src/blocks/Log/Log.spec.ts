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
  inject
} from '@nano_kit/store'
import { RegistryStore$ } from '../../stores/registry.js'
import { SignalsStore$ } from '../../stores/signals.js'
import { LogStore$ } from '../../stores/log.js'
import {
  Cart$,
  withMockApp
} from '../shared/app.mock.js'
import { Log } from './Log.js'

// The log over the application of the stories, a new one for each test, driven by hand
async function setup() {
  let context!: InjectionContext
  const Story = composeStory({
    render() {
      context = getContext()!

      return Log()
    }
  }, {
    decorators: [withMockApp()]
  })

  render(Story())

  // The events of the application come a microtask after it started
  await Promise.resolve()

  return context
}

// The cart moves on, in a task of its own
async function tick(context: InjectionContext) {
  inject(Cart$, context).tick()

  await Promise.resolve()
}

function groupRows() {
  return screen.getAllByRole<HTMLTableRowElement>('row').filter(row => row.getAttribute('aria-level') === '1')
}

function lineRow(text: string) {
  return screen.getAllByText(text)
    .map(element => element.closest('tr')!)
    .find(row => row.getAttribute('aria-level') === '2')!
}

describe('devtools', () => {
  describe('blocks', () => {
    describe('Log', () => {
      it('should show a row per transaction, newest first, folded', async () => {
        const context = await setup()

        await tick(context)
        await tick(context)

        // The first cell holds the chevron and the number of the group
        const [newest, before] = groupRows().map(row => Number(row.cells[0].textContent.slice(1)))

        expect(newest).toBe(before + 1)
        expect(screen.getAllByRole('row').filter(row => row.getAttribute('aria-level') === '2')).toEqual([])
      })

      it('should count the lines of a transaction and tell how long it took', async () => {
        const context = await setup()

        await tick(context)

        const [row] = groupRows()

        expect(row.textContent).toMatch(/1 write · 2 computed · 1 effect · 1 invalidated/)
        expect(within(row).getByText(/ms$/)).toBeDefined()
      })

      it('should open a transaction into its lines, a run under the run it happened in', async () => {
        const context = await setup()

        await tick(context)

        const [row] = groupRows()

        fireEvent.click(within(row).getByRole('button'))

        const cart = inject(Cart$, context)
        const { recordOf } = inject(RegistryStore$, context)
        const nameOf = (node: Parameters<typeof recordOf>[0]) => recordOf(node)!.name.name
        const nested = (name: string) => lineRow(name).querySelector('[style*="--logDepth"]') !== null

        // The total is evaluated to tell whether the effect has to run, before it does;
        // the count is read by the body of the effect and evaluated inside its run
        expect(nested(nameOf(cart.$total.node))).toBe(false)
        expect(nested(nameOf(cart.$count.node))).toBe(true)
        expect(nested(nameOf(cart.$total.node.subs!.sub))).toBe(false)
        expect(within(lineRow(nameOf(cart.$total.node))).getByText(/→/)).toBeDefined()
      })

      it('should select the node of a line that was clicked', async () => {
        const context = await setup()

        await tick(context)

        const cart = inject(Cart$, context)
        const { recordOf } = inject(RegistryStore$, context)
        const record = recordOf(cart.$items.node)!

        fireEvent.click(within(groupRows()[0]).getByRole('button'))
        fireEvent.click(lineRow(record.name.name))

        expect(inject(SignalsStore$, context).$selected()?.id).toBe(record.id)
      })

      it('should say so while the log is empty', async () => {
        const context = await setup()

        inject(LogStore$, context).clear()

        expect(screen.getByText(/^Nothing yet/)).toBeDefined()
      })
    })
  })
})
