import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import {
  render,
  screen,
  fireEvent
} from '@nanoviews/testing-library'
import { signal } from 'nanoviews/store'
import {
  ValueChildren,
  ValueNode,
  ValueTree
} from './index.js'

function View($expanded = signal(false)) {
  return (
    ValueTree({
      label: 'Value'
    })(
      ValueNode({
        $expanded
      })(
        'Array(1)',
        ValueChildren()(
          ValueNode({
            name: '0'
          })(
            '"first"'
          )
        )
      )
    )
  )
}

describe('devtools', () => {
  describe('uikit', () => {
    describe('ValueTree', () => {
      it('should build the entries only once the node is expanded', () => {
        const $expanded = signal(false)

        render(() => View($expanded))

        expect(screen.getByRole('tree', {
          name: 'Value'
        })).toBeDefined()
        expect(screen.queryByText('"first"')).toBeNull()
        expect(screen.getByRole('treeitem').textContent).toBe('Array(1)')

        $expanded(true)

        expect(screen.getByText('"first"')).toBeDefined()
        expect(screen.getByRole('group')).toBeDefined()
      })

      it('should toggle on a click on the row', () => {
        const $expanded = signal(false)

        render(() => View($expanded))

        fireEvent.click(screen.getByText('Array(1)'))
        expect($expanded()).toBe(true)

        fireEvent.click(screen.getByText('Array(1)'))
        expect($expanded()).toBe(false)
      })

      it('should expand and collapse from the keyboard', () => {
        const $expanded = signal(false)

        render(() => View($expanded))

        const [node] = screen.getAllByRole('treeitem')

        fireEvent.keyDown(node, {
          key: 'ArrowRight'
        })
        expect($expanded()).toBe(true)
        expect(node.getAttribute('aria-expanded')).toBe('true')

        fireEvent.keyDown(node, {
          key: 'ArrowLeft'
        })
        expect($expanded()).toBe(false)

        fireEvent.keyDown(node, {
          key: 'Enter'
        })
        expect($expanded()).toBe(true)
      })

      it('should call the keydown handler given from outside after its own', () => {
        const $expanded = signal(false)
        const onKeyDown = vi.fn()

        render(() => ValueNode({
          $expanded,
          onKeyDown
        })(
          'Array(1)'
        ))

        fireEvent.keyDown(screen.getByRole('treeitem'), {
          key: 'ArrowRight'
        })

        expect($expanded()).toBe(true)
        expect(onKeyDown).toHaveBeenCalledTimes(1)
      })

      it('should give a leaf the keydown handler given from outside', () => {
        const onKeyDown = vi.fn()

        render(() => ValueNode({
          name: '0',
          onKeyDown
        })(
          '"first"'
        ))

        fireEvent.keyDown(screen.getByRole('treeitem'), {
          key: 'Enter'
        })

        expect(onKeyDown).toHaveBeenCalledTimes(1)
      })

      it('should leave a leaf without a toggle', () => {
        render(() => View(signal(true)))

        const leaf = screen.getAllByRole('treeitem')[1]

        expect(leaf.hasAttribute('aria-expanded')).toBe(false)
        expect(leaf.hasAttribute('tabindex')).toBe(false)
      })
    })
  })
})
