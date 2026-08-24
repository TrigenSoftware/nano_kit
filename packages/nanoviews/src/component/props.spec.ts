import {
  describe,
  it,
  expect,
  expectTypeOf,
  vi
} from 'vitest'
import { render } from '@nanoviews/testing-library'
import {
  type Accessor,
  type Signalish,
  signal,
  effect
} from 'kida'
import { button } from '../elements/elements.js'
import { classList$ } from '../elements/classList.js'
import { props$ } from './props.js'

interface ButtonProps {
  title: Signalish<string>
  size?: Signalish<'s' | 'm' | 'l'>
  onSelect: (event: Event) => void
  id?: string
}

describe('nanoviews', () => {
  describe('component', () => {
    describe('props$', () => {
      it('should hand back a prop as it arrived', () => {
        const { type } = props$({
          type: 'button'
        })

        expect(type).toBe('button')
      })

      it('should wrap a static prop into an accessor', () => {
        const { $type } = props$({
          type: 'button'
        })

        expect($type).toBeTypeOf('function')
        expect($type()).toBe('button')
      })

      it('should hand back a signal prop as it is', () => {
        const $size = signal<'s' | 'm'>('s')
        const props = props$({
          size: $size
        })

        expect(props.$size).toBe($size)
      })

      it('should hand back a callback prop as it is', () => {
        const onSelect = vi.fn()
        const props = props$({
          onSelect
        })

        expect(props.$onSelect).toBe(onSelect)
      })

      it('should return the same accessor on every read', () => {
        const props = props$({
          type: 'button'
        })

        expect(props.$type).toBe(props.$type)
      })

      it('should let a destructuring default fill in a prop that is not set', () => {
        const defaultSize = () => 'm' as const
        const { $size = defaultSize } = props$({
          title: 'Send',
          onSelect: () => {}
        } as ButtonProps)

        expect($size).toBe(defaultSize)
        expect($size()).toBe('m')
      })

      it('should track a signal prop read through the accessor', () => {
        const $size = signal<'s' | 'm'>('s')
        const { $size: $read } = props$({
          size: $size
        })
        const sizes: string[] = []
        const stop = effect(() => {
          sizes.push($read())
        })

        $size('m')

        expect(sizes).toEqual([
          's',
          'm'
        ])

        stop()
      })

      it('should prefer an own `$` prop over the twin', () => {
        const $own = signal('own')
        const props = props$({
          html: 'raw',
          $html: $own
        })

        expect(props.$html).toBe($own)
        // the twin of the own `$` prop is reachable with one more `$`
        expect(props.$$html).toBe($own)
      })

      describe('rest', () => {
        it('should keep props that were not taken, as they arrived', () => {
          const onSelect = vi.fn()
          const {
            $title,
            id,
            ...restProps
          } = props$({
            title: 'Send',
            size: 'm',
            onSelect,
            id: 'submit'
          } as ButtonProps)

          expect($title()).toBe('Send')
          expect(id).toBe('submit')
          expect(restProps).toEqual({
            size: 'm',
            onSelect
          })
          expect(restProps.onSelect).toBe(onSelect)
        })

        it('should give the same result on a second destructuring', () => {
          const props = props$({
            title: 'Send',
            size: 'm',
            id: 'submit'
          } as ButtonProps)
          const {
            $title,
            ...rest
          } = props
          const {
            $title: $titleAgain,
            ...restAgain
          } = props

          expect($titleAgain).toBe($title)
          expect(restAgain).toEqual(rest)
        })

        it('should leave the props object it was given readable', () => {
          const props = {
            title: 'Send',
            id: 'submit'
          }
          const wrapped = props$(props)
          const { $title } = wrapped

          expect($title()).toBe('Send')
          // the props object is the caller's: it keeps every prop it came
          // with, and the accessor it gains is hidden from enumeration
          expect(props.title).toBe('Send')
          expect(props).toEqual({
            title: 'Send',
            id: 'submit'
          })
          expect(Object.keys(props)).toEqual([
            'title',
            'id'
          ])
          expect(wrapped.$title).toBe($title)
        })
      })

      it('should type accessors, raw props and rest', () => {
        const {
          $title,
          $size,
          onSelect,
          ...restProps
        } = props$({
          title: 'Send',
          onSelect: () => {}
        } as ButtonProps)

        expectTypeOf($title).toEqualTypeOf<Accessor<string>>()
        expectTypeOf($size).toEqualTypeOf<Accessor<'s' | 'm' | 'l'> | undefined>()
        expectTypeOf(onSelect).toEqualTypeOf<(event: Event) => void>()
        expectTypeOf(restProps.id).toEqualTypeOf<string | undefined>()
      })

      it('should carry the rest into an element', () => {
        function Button(props: ButtonProps) {
          const {
            $size,
            ...restProps
          } = props$(props)

          return button({
            ...restProps,
            [classList$]: [
              'button',
              () => `button_${$size?.() ?? 'm'}`
            ]
          })('Send')
        }

        const $size = signal<'s' | 'm' | 'l'>('s')
        const { container } = render(() => Button({
          title: 'Send it',
          size: $size,
          onSelect: () => {},
          id: 'send'
        }))

        expect(container.innerHTML).toBe('<div><button title="Send it" id="send" class="button button_s">Send</button></div>')

        $size('l')

        expect(container.innerHTML).toBe('<div><button title="Send it" id="send" class="button button_l">Send</button></div>')
      })
    })
  })
})
