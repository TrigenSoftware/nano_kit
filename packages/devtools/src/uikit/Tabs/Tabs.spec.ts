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
  Tab,
  Tabs
} from './index.js'

function View($value = signal('signals')) {
  return (
    Tabs({
      label: 'View',
      $value
    })(
      Tab({
        value: 'signals'
      })(
        'Signals'
      ),
      Tab({
        value: 'log'
      })(
        'Log'
      ),
      Tab({
        value: 'queries',
        disabled: true
      })(
        'Queries'
      )
    )
  )
}

describe('devtools', () => {
  describe('uikit', () => {
    describe('Tabs', () => {
      it('should render a radio group with the selected tab checked', () => {
        render(() => View())

        expect(screen.getByRole('radiogroup', {
          name: 'View'
        })).toBeDefined()
        expect(screen.getByRole<HTMLInputElement>('radio', {
          name: 'Signals'
        }).checked).toBe(true)
        expect(screen.getByRole<HTMLInputElement>('radio', {
          name: 'Log'
        }).checked).toBe(false)
        expect(screen.getByRole<HTMLInputElement>('radio', {
          name: 'Queries'
        }).disabled).toBe(true)
      })

      it('should write the value of the tab that was clicked', () => {
        const $value = signal('signals')

        render(() => View($value))

        fireEvent.click(screen.getByRole('radio', {
          name: 'Log'
        }))

        expect($value()).toBe('log')
        expect(screen.getByRole<HTMLInputElement>('radio', {
          name: 'Signals'
        }).checked).toBe(false)
      })

      it('should call the change handler given from outside after its own', () => {
        const $value = signal('signals')
        const onChange = vi.fn()

        render(() => Tabs({
          label: 'View',
          $value,
          onChange
        })(
          Tab({
            value: 'log'
          })(
            'Log'
          )
        ))

        fireEvent.click(screen.getByRole('radio', {
          name: 'Log'
        }))

        expect($value()).toBe('log')
        expect(onChange).toHaveBeenCalledTimes(1)
      })

      it('should follow a value written from outside', () => {
        const $value = signal('signals')

        render(() => View($value))

        $value('log')

        expect(screen.getByRole<HTMLInputElement>('radio', {
          name: 'Log'
        }).checked).toBe(true)
        expect(screen.getByRole<HTMLInputElement>('radio', {
          name: 'Signals'
        }).checked).toBe(false)
      })
    })
  })
})
