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
import { div } from 'nanoviews'
import { Disclosure } from './Disclosure.js'

describe('devtools', () => {
  describe('uikit', () => {
    describe('Disclosure', () => {
      it('should toggle the expanded signal and reflect it in aria-expanded', () => {
        const $expanded = signal(false)

        render(() => Disclosure({
          $expanded,
          label: 'Cart$'
        }))

        const button = screen.getByRole('button', {
          name: 'Cart$'
        })

        expect(button.getAttribute('aria-expanded')).toBe('false')
        fireEvent.click(button)
        expect($expanded()).toBe(true)
        expect(button.getAttribute('aria-expanded')).toBe('true')
      })

      it('should not let the click reach the row around it', () => {
        const onRowClick = vi.fn()

        render(() => div({
          onClick: onRowClick
        })(
          Disclosure({
            $expanded: signal(false),
            label: 'Cart$'
          })
        ))

        fireEvent.click(screen.getByRole('button'))

        expect(onRowClick).not.toHaveBeenCalled()
      })
    })
  })
})
