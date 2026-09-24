import {
  describe,
  it,
  expect,
  vi
} from 'vitest'
import {
  render,
  screen,
  fireEvent
} from '@nanoviews/testing-library'
import { signal } from 'nanoviews/store'
import {
  fragment,
  if_
} from 'nanoviews'
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableTreeCell
} from './index.js'

// A group with two rows in it, then a group of its own
function setup() {
  const $expanded = signal(true)
  const $selected = signal(false)
  const onClick = vi.fn()

  render(() => Table({
    label: 'Signals'
  })(
    TableBody()(
      TableRow({
        label: 'Cart$',
        $expanded,
        group: true
      })(
        TableTreeCell()('Cart$')
      ),
      if_($expanded)(() => fragment(
        TableRow({
          label: 'total',
          level: 2,
          onClick
        })(
          TableTreeCell()('total'),
          TableCell()('148')
        ),
        TableRow({
          label: 'count',
          level: 2,
          selected: $selected
        })(
          TableTreeCell()('count'),
          TableCell()('3')
        )
      )),
      TableRow({
        label: 'User$',
        group: true
      })(
        TableTreeCell()('User$')
      )
    )
  ))

  return {
    $expanded,
    $selected,
    onClick
  }
}

function rowOf(name: string) {
  return screen.getByText(name).closest('tr')!
}

function press(key: string) {
  fireEvent.keyDown(document.activeElement!, {
    key
  })
}

describe('devtools', () => {
  describe('uikit', () => {
    describe('Table', () => {
      it('should stop the tab at the table until a row takes it, and never at a chevron', () => {
        setup()

        expect(screen.getByRole('treegrid').getAttribute('tabindex')).toBe('0')
        expect(screen.getAllByRole('row').map(row => row.getAttribute('tabindex'))).toEqual(['-1', '-1', '-1', '-1'])
        expect(screen.getByRole('button', {
          name: 'Cart$'
        }).getAttribute('tabindex')).toBe('-1')
      })

      it('should hand the focus from the table to its first row, which takes the tab stop', () => {
        setup()

        screen.getByRole('treegrid').focus()

        expect(document.activeElement).toBe(rowOf('Cart$'))
        expect(rowOf('Cart$').getAttribute('tabindex')).toBe('0')
        expect(screen.getByRole('treegrid').hasAttribute('tabindex')).toBe(false)
      })

      it('should hand the focus from the table to the selected row', () => {
        const { $selected } = setup()

        $selected(true)
        screen.getByRole('treegrid').focus()

        expect(document.activeElement).toBe(rowOf('count'))
      })

      it('should move between the rows with the arrows, Home and End', () => {
        setup()
        rowOf('Cart$').focus()

        press('ArrowDown')

        expect(document.activeElement).toBe(rowOf('total'))

        press('End')

        expect(document.activeElement).toBe(rowOf('User$'))

        press('Home')
        press('ArrowUp')

        expect(document.activeElement).toBe(rowOf('Cart$'))
      })

      it('should close an open row with the left arrow and open it with the right one', () => {
        const { $expanded } = setup()

        rowOf('Cart$').focus()
        press('ArrowLeft')

        expect($expanded()).toBe(false)
        expect(screen.queryByText('total')).toBeNull()

        press('ArrowRight')

        expect($expanded()).toBe(true)
        expect(document.activeElement).toBe(rowOf('Cart$'))
      })

      it('should go down to the first child with the right arrow and up to the parent with the left one', () => {
        setup()
        rowOf('Cart$').focus()

        press('ArrowRight')

        expect(document.activeElement).toBe(rowOf('total'))

        press('ArrowLeft')

        expect(document.activeElement).toBe(rowOf('Cart$'))
      })

      it('should act on Enter and Space as on a click', () => {
        const { onClick } = setup()

        rowOf('total').focus()
        press('Enter')
        press(' ')

        expect(onClick).toHaveBeenCalledTimes(2)
      })

      it('should leave a key pressed on a control inside a row to the control', () => {
        setup()

        const row = rowOf('Cart$')

        row.focus()
        fireEvent.keyDown(screen.getByRole('button', {
          name: 'Cart$'
        }), {
          key: 'ArrowDown'
        })

        expect(document.activeElement).toBe(row)
      })

      it('should give the tab stop back to the table once its row is gone', () => {
        const { $expanded } = setup()

        rowOf('total').focus()
        $expanded(false)

        expect(screen.getByRole('treegrid').getAttribute('tabindex')).toBe('0')
      })
    })
  })
})
