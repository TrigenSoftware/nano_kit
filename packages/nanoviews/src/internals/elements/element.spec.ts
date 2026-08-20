import {
  vi,
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
import {
  signal,
  effect
} from 'kida'
import * as Stories from './element.stories.js'
import { createElement } from './element.js'

const {
  StaticPrimitiveChild,
  ReactivePrimitiveChild,
  StaticPrimitiveAttribute,
  ReactivePrimitiveAttribute,
  Events,
  Children,
  NoChildren
} = composeStories(Stories)

describe('nanoviews', () => {
  describe('internals', () => {
    describe('elements', () => {
      describe('element', () => {
        it('should render static primitive child', () => {
          const { container } = render(StaticPrimitiveChild())

          expect(container.innerHTML).toBe('<div><b>Hello, world!</b></div>')
        })

        it('should render reactive primitive child', () => {
          const text = signal('Hello, world!')
          const { container } = render(ReactivePrimitiveChild({
            text
          }))

          expect(container.innerHTML).toBe('<div><b>Hello, world!</b></div>')

          text('Hello, nanoviews!')

          expect(container.innerHTML).toBe('<div><b>Hello, nanoviews!</b></div>')
        })

        it('should render static primitive attribute', () => {
          const { container } = render(StaticPrimitiveAttribute())

          expect(container.innerHTML).toBe('<div><a href="#">Link!</a></div>')
        })

        it('should render reactive primitive attribute', () => {
          const href = signal<string | undefined>('#')
          const { container } = render(ReactivePrimitiveAttribute({
            href
          }))

          expect(container.innerHTML).toBe('<div><a href="#">Link!</a></div>')

          href('https://github.com/dangreen')

          expect(container.innerHTML).toBe('<div><a href="https://github.com/dangreen">Link!</a></div>')
        })

        it('should remove reactive attribute', () => {
          const href = signal<string | undefined>('#')
          const { container } = render(ReactivePrimitiveAttribute({
            href
          }))

          expect(container.innerHTML).toBe('<div><a href="#">Link!</a></div>')

          // @ts-expect-error - test case
          href(null)

          expect(container.innerHTML).toBe('<div><a>Link!</a></div>')

          href('#')

          expect(container.innerHTML).toBe('<div><a href="#">Link!</a></div>')

          href(undefined)

          expect(container.innerHTML).toBe('<div><a>Link!</a></div>')
        })

        it('should render boolean reactive attribute', () => {
          const dataValue = signal<string | boolean>('#')
          const { container } = render(() => createElement('span', {
            'data-value': dataValue
          })('Data attribute test'))

          expect(container.innerHTML).toBe('<div><span data-value="#">Data attribute test</span></div>')

          dataValue(true)

          expect(container.innerHTML).toBe('<div><span data-value="true">Data attribute test</span></div>')

          dataValue(false)

          expect(container.innerHTML).toBe('<div><span data-value="false">Data attribute test</span></div>')
        })

        it('should handle events', () => {
          const onClick = vi.fn()
          const { container } = render(Events({
            onClick
          }))

          expect(container.innerHTML).toBe('<div><button>Click me!</button></div>')

          fireEvent.click(screen.getByRole('button'))

          expect(onClick).toHaveBeenCalled()
        })

        it('should handle events that do not bubble', () => {
          const onFocus = vi.fn()
          const onPlay = vi.fn()
          const { container } = render(() => createElement('div')(
            createElement('input', {
              onFocus
            })(),
            createElement('video', {
              onPlay
            })()
          ))

          container.querySelector('input')!.dispatchEvent(new Event('focus'))
          container.querySelector('video')!.dispatchEvent(new Event('play'))

          expect(onFocus).toHaveBeenCalledTimes(1)
          expect(onPlay).toHaveBeenCalledTimes(1)
        })

        it('should handle capture events ahead of bubbling ones', () => {
          const calls: string[] = []
          const { container } = render(() => createElement('div', {
            onClickCapture: () => calls.push('outer capture'),
            onClick: () => calls.push('outer')
          })(
            createElement('button', {
              onClickCapture: () => calls.push('button capture'),
              onClick: () => calls.push('button')
            })()
          ))

          fireEvent.click(container.querySelector('button')!)

          expect(calls).toEqual([
            'outer capture',
            'button capture',
            'button',
            'outer'
          ])
        })

        it('should spell the double click prop the way the DOM spells the event', () => {
          const onDblClick = vi.fn()
          const { container } = render(() => createElement('button', {
            onDblClick
          })())

          fireEvent.dblClick(container.querySelector('button')!)

          expect(onDblClick).toHaveBeenCalledTimes(1)
        })

        it('should not read a pointer capture event as a capture handler', () => {
          const calls: string[] = []
          const { container } = render(() => createElement('div', {
            onGotPointerCaptureCapture: () => calls.push('capture')
          })(
            createElement('button', {
              onGotPointerCapture: () => calls.push('bubble')
            })()
          ))

          container.querySelector('button')!.dispatchEvent(
            new Event('gotpointercapture', {
              bubbles: true
            })
          )

          expect(calls).toEqual([
            'capture',
            'bubble'
          ])
        })

        it('should not subscribe the effect an event was dispatched from', () => {
          const $tick = signal(0)
          const reads: number[] = []
          let runs = 0
          const { container } = render(() => createElement('button', {
            onClick: () => reads.push($tick())
          })())
          const button = container.querySelector('button')!
          const stop = effect(() => {
            runs++
            $tick()
            button.click()
          })

          expect(runs).toBe(1)
          expect(reads).toEqual([0])

          $tick(1)

          // the handler read `$tick`, but it read it for itself: the effect
          // that dispatched the click is woken by its own dependency only
          expect(runs).toBe(2)
          expect(reads).toEqual([0, 1])

          stop()
        })

        it('should render children', () => {
          const { container } = render(Children())

          expect(container.innerHTML).toBe('<div><ul><li>One</li><li>Two</li><li>Three</li></ul></div>')
        })

        it('should render no elements without children', () => {
          const { container } = render(NoChildren())

          expect(container.innerHTML).toBe('<div><div><hr>^ hr, br &gt;<br>^ br, hr &gt;<hr></div></div>')
        })
      })
    })
  })
})
