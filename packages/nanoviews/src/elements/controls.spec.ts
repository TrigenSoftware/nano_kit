import {
  describe,
  it,
  expect
} from 'vitest'
import { composeStories } from '@nanoviews/storybook'
import {
  render,
  screen,
  fireEvent
} from '@nanoviews/testing-library'
import { userEvent } from '@testing-library/user-event'
import { signal } from 'kida'
import * as Stories from './controls.stories.js'
import type { Indeterminate } from './controls.js'

const {
  TextInput,
  Textarea,
  Select,
  MultipleSelect,
  Checkbox,
  Files
} = composeStories(Stories)

describe('nanoviews', () => {
  describe('elements', () => {
    describe('controls', () => {
      describe('value$', () => {
        it('should handle value of text input', () => {
          const value = signal('Hello, world!')

          render(TextInput({
            value
          }))

          const input = screen.getByRole<HTMLInputElement>('textbox')

          expect(input.value).toBe('Hello, world!')

          value('Hello, nanoviews!')

          expect(input.value).toBe('Hello, nanoviews!')

          fireEvent.change(input, {
            target: {
              value: 'user input'
            }
          })

          expect(input.value).toBe('user input')
        })

        it('should handle value of textarea', () => {
          const value = signal('Hello, world!')

          render(Textarea({
            value
          }))

          const textarea = screen.getByRole<HTMLTextAreaElement>('textbox')

          expect(textarea.value).toBe('Hello, world!')

          value('Hello, nanoviews!')

          expect(textarea.value).toBe('Hello, nanoviews!')

          fireEvent.change(textarea, {
            target: {
              value: 'user input'
            }
          })

          expect(textarea.value).toBe('user input')
        })
      })

      describe('selected$', () => {
        it('should handle value of select', () => {
          const value = signal('green')

          render(Select({
            value
          }))

          const select = screen.getByRole<HTMLSelectElement>('combobox')

          expect(select.value).toBe('green')

          value('red')

          expect(select.value).toBe('red')

          fireEvent.change(select, {
            target: {
              value: 'blue'
            }
          })

          expect(select.value).toBe('blue')
        })

        it('should handle multiple values of select', () => {
          const values = signal(['green', 'blue'])

          render(MultipleSelect({
            values
          }))

          expect(screen.getAllByRole<HTMLSelectElement>('option', {
            selected: true
          })).toHaveLength(2)

          const select = screen.getByRole<HTMLSelectElement>('listbox')

          fireEvent.change(select, {
            target: {
              value: 'blue'
            }
          })

          expect(screen.getAllByRole<HTMLSelectElement>('option', {
            selected: true
          })).toHaveLength(1)
        })
      })

      describe('checked$', () => {
        it('should handle checked state of checkbox', () => {
          const checked = signal<boolean | typeof Indeterminate>(true)

          render(Checkbox({
            checked
          }))

          const checkbox = screen.getByRole<HTMLInputElement>('checkbox')

          expect(checkbox.checked).toBe(true)

          checked(false)

          expect(checkbox.checked).toBe(false)

          fireEvent.change(checkbox, {
            target: {
              checked: true
            }
          })

          expect(checkbox.checked).toBe(true)
        })
      })

      describe('files$', () => {
        it('should save files to signal', async () => {
          const files = signal<File[]>([])
          const user = userEvent.setup()
          const file = new File(['hello'], 'hello.png', {
            type: 'image/png'
          })
          const { container } = render(Files({
            files
          }))
          const fileInput = container.firstChild?.firstChild as HTMLInputElement

          await user.upload(fileInput, file)

          expect(files()[0]).toBe(file)
        })
      })
    })
  })
})
