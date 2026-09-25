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
  batch,
  signal,
  selector,
  effect,
  effectScope
} from '@nano_kit/store'
import type { NodeKind } from '../../services/registry/index.js'
import { RegistryStore$ } from '../../stores/registry.js'
import { SignalsStore$ } from '../../stores/signals.js'
import {
  Cart$,
  withMockApp
} from '../shared/app.mock.js'
import { Inspector } from './Inspector.js'

// The inspector over the application of the stories, a new one for each test, driven by hand
async function setup(select?: (ctx: any) => unknown) {
  let context!: InjectionContext
  const Story = composeStory({
    parameters: {
      select
    },
    render() {
      context = getContext()!

      return Inspector()
    }
  }, {
    decorators: [withMockApp()]
  })

  render(Story())

  // The records of the application come a microtask after it started, and the selection right after them
  await Promise.resolve()

  return context
}

// The last record of a kind the registry holds: the node a test created, after those of the application
function recordOfKind(context: InjectionContext, kind: NodeKind) {
  const { records } = inject(RegistryStore$, context)

  return [...records.keys()].map(id => records.get(id)!).findLast(record => record.kind === kind)!
}

function box(title: string) {
  return within(screen.getByRole('heading', {
    name: title
  }).closest('section')!)
}

describe('devtools', () => {
  describe('blocks', () => {
    describe('Inspector', () => {
      it('should show the source of a computed under its value', async () => {
        await setup(ctx => ctx.$total)

        const value = box('Value')

        expect(value.getByRole('heading', {
          name: 'Compute'
        })).toBeDefined()
        expect(value.getByText(/\$items\(\)\.reduce/)).toBeDefined()
      })

      it('should show the body of an effect in place of its value', async () => {
        // The effect of the cart reads its total first
        await setup(ctx => ({
          node: ctx.$total.node.subs.sub
        }))

        expect(box('Body').getByText(/\$total\(\)/)).toBeDefined()
      })

      it('should ask for a row while nothing is selected', async () => {
        await setup()

        expect(screen.getByText('Select a row to inspect it.')).toBeDefined()
      })

      it('should show the value a key of a selector answers with', async () => {
        const context = await setup()
        const $id = signal(1)
        const $isSelected = selector($id)
        const stop = effect(() => {
          $isSelected(1)
        })

        await Promise.resolve()

        inject(SignalsStore$, context).select(recordOfKind(context, 'selector').id)

        expect(box('Value').getByText('true')).toBeDefined()

        stop()
      })

      it('should say that a scope has no value', async () => {
        const context = await setup()
        const stop = effectScope(() => {
          effect(() => {})
        })

        await Promise.resolve()

        inject(SignalsStore$, context).select(recordOfKind(context, 'scope').id)

        expect(box('Value').getByText(/^A scope has no value/)).toBeDefined()

        stop()
      })

      it('should say what the selected node is', async () => {
        await setup(ctx => ctx.$total)

        const node = box('Node')

        expect(node.getByText('computed')).toBeDefined()
        expect(node.getByText('Cart$')).toBeDefined()
        expect(node.getByText(/^app\.mock\.ts:\d+$/)).toBeDefined()
        expect(node.getByText('active')).toBeDefined()
      })

      it('should show the value and follow it', async () => {
        const context = await setup(ctx => ctx.$total)

        expect(box('Value').getByText('148')).toBeDefined()

        inject(Cart$, context).tick()

        await Promise.resolve()

        expect(box('Value').getByText('237')).toBeDefined()
      })

      it('should open a collection an entry at a time', async () => {
        await setup(ctx => ctx.$items)

        const value = box('Value')

        // The root is open, its entries are folded
        expect(value.getByText('0')).toBeDefined()
        expect(value.queryByText('"Mechanical keyboard, 75%"')).toBeNull()

        fireEvent.click(value.getByText('0'))

        expect(value.getByText('"Mechanical keyboard, 75%"')).toBeDefined()
        expect(value.getByText('title')).toBeDefined()
      })

      it('should offer to evaluate a computed nobody has read, and do it once asked', async () => {
        await setup(ctx => ctx.$discount)

        const value = box('Value')

        expect(value.getByText(/^Not evaluated yet/)).toBeDefined()

        fireEvent.click(value.getByRole('button', {
          name: 'Evaluate now'
        }))

        await Promise.resolve()

        expect(value.queryByText(/^Not evaluated yet/)).toBeNull()
        expect(value.getByText('0')).toBeDefined()
      })

      it('should ask for a row again once the selected record left', async () => {
        const context = await setup(ctx => ctx.$coupon)
        const {
          records,
          idOf
        } = inject(RegistryStore$, context)

        expect(box('Node').getByText('unmounted')).toBeDefined()

        // The way the registry lets go of a node that was collected: inside a batch
        batch(() => {
          records.delete(idOf(inject(Cart$, context).$coupon.node)!)
        })

        expect(screen.getByText('Select a row to inspect it.')).toBeDefined()
        expect(screen.queryByRole('heading')).toBeNull()
      })

      it('should show an effect that reads the node by its name and its site, with no link', async () => {
        await setup(ctx => ctx.$total)

        const links = box('Links')

        // The one link is the signal the total reads
        expect(links.getAllByRole('button')).toHaveLength(1)
        expect(links.getByText(/^app\.mock\.ts:\d+$/)).toBeDefined()
      })

      it('should show what happened to the node lately, with the number of its transaction', async () => {
        const context = await setup(ctx => ctx.$total)

        inject(Cart$, context).tick()

        await Promise.resolve()

        const recent = box('Recent')

        expect(recent.getAllByText(/^#\d+$/).length).toBeGreaterThan(0)
        expect(recent.getAllByText('computed').length).toBeGreaterThan(0)
      })

      it('should tell how long the last run of the node took', async () => {
        const context = await setup(ctx => ctx.$total)

        inject(Cart$, context).tick()

        await Promise.resolve()

        expect(box('Node').getByText(/ms$/)).toBeDefined()
      })

      it('should lead to the rows of what the node reads and what reads it', async () => {
        await setup(ctx => ctx.$total)

        const links = box('Links')
        const [dep] = links.getAllByRole('button')

        fireEvent.click(dep)

        await Promise.resolve()

        expect(box('Node').getByText('signal')).toBeDefined()
      })
    })
  })
})
