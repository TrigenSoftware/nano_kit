import {
  describe,
  it,
  expect,
  vi
} from 'vitest'
import { render } from '@nanoviews/testing-library'
import {
  signal,
  effect
} from 'kida'
import { createElement } from '../elements/index.js'
import { show } from './show.js'

describe('nanoviews', () => {
  describe('internals', () => {
    describe('flow', () => {
      describe('show', () => {
        it('should build the tree hidden and mount it when the value turns truthy', () => {
          const $visible = signal(false)
          const $text = signal('a')
          const renderFn = vi.fn(() => createElement('div')($text))
          const { container } = render(() => show($visible, renderFn))

          expect(renderFn).toHaveBeenCalledTimes(1)
          expect(container.innerHTML).toBe('<div></div>')

          $visible(true)

          expect(container.innerHTML).toBe('<div><div>a</div></div>')

          $visible(false)

          expect(container.innerHTML).toBe('<div></div>')

          $visible(true)

          expect(container.innerHTML).toBe('<div><div>a</div></div>')
          expect(renderFn).toHaveBeenCalledTimes(1)
        })

        it('should hand the initial truthy tree over in the first pass', () => {
          const $visible = signal(true)
          const log: string[] = []
          const { container } = render(() => {
            const child = show($visible, () => {
              effect(() => {
                log.push('content')
              })

              return createElement('div')('shown')
            })

            effect(() => {
              log.push('after')
            })

            return child
          })

          expect(container.innerHTML).toBe('<div><div>shown</div></div>')
          expect(log).toEqual(['content', 'after'])

          $visible(false)

          expect(container.innerHTML).toBe('<div></div>')

          $visible(true)

          expect(container.innerHTML).toBe('<div><div>shown</div></div>')
        })

        it('should keep the hidden tree up to date through `noDefer` effects', () => {
          const $visible = signal(false)
          const $text = signal('a')
          const { container } = render(() => show($visible, () => createElement('div')($text)))

          $text('b')
          $visible(true)

          expect(container.innerHTML).toBe('<div><div>b</div></div>')

          $visible(false)
          $text('c')
          $visible(true)

          expect(container.innerHTML).toBe('<div><div>c</div></div>')
        })

        it('should run deferred effects only while shown and sync them on wake', () => {
          const $visible = signal(false)
          const $value = signal(1)
          const log: string[] = []

          render(() => show($visible, () => {
            effect(() => {
              log.push(`deferred ${$value()}`)

              return () => log.push('cleanup')
            })

            return createElement('div')('content')
          }))

          expect(log).toEqual([])

          $visible(true)

          expect(log).toEqual(['deferred 1'])
          log.length = 0

          $visible(false)

          expect(log).toEqual(['cleanup'])
          log.length = 0

          $value(2)

          expect(log).toEqual([])

          $visible(true)

          expect(log).toEqual(['deferred 2'])
        })

        it('should keep an inner hidden show down across outer toggles', () => {
          const $outer = signal(true)
          const $inner = signal(false)
          const log: string[] = []
          const { container } = render(() => show($outer, () => createElement('div')(
            'outer',
            show($inner, () => {
              effect(() => {
                log.push('inner effect')
              })

              return createElement('span')('inner')
            })
          )))

          expect(container.innerHTML).toBe('<div><div>outer</div></div>')
          expect(log).toEqual([])

          $outer(false)
          $outer(true)

          expect(container.innerHTML).toBe('<div><div>outer</div></div>')
          expect(log).toEqual([])

          $inner(true)

          expect(container.innerHTML).toBe('<div><div>outer<span>inner</span></div></div>')
          expect(log).toEqual(['inner effect'])

          $outer(false)
          $outer(true)

          expect(container.innerHTML).toBe('<div><div>outer<span>inner</span></div></div>')
        })

        it('should apply an inner toggle flipped before the first show of the outer', () => {
          const $outer = signal(false)
          const $inner = signal(true)
          const log: string[] = []
          const { container } = render(() => show($outer, () => createElement('div')(
            'outer',
            show($inner, () => {
              effect(() => {
                log.push('inner effect')
              })

              return createElement('span')('inner')
            })
          )))

          $inner(false)

          expect(log).toEqual([])

          $outer(true)

          expect(container.innerHTML).toBe('<div><div>outer</div></div>')
          expect(log).toEqual([])

          $inner(true)

          expect(container.innerHTML).toBe('<div><div>outer<span>inner</span></div></div>')
          expect(log).toEqual(['inner effect'])
        })

        it('should apply a value written back from inside a waking effect', () => {
          const $visible = signal(false)
          const { container } = render(() => show($visible, () => {
            effect(() => {
              $visible(false)
            })

            return createElement('div')('content')
          }))

          $visible(true)

          expect(container.innerHTML).toBe('<div></div>')
        })

        it('should run cleanups while the DOM is still attached', () => {
          const $visible = signal(true)
          let connected: boolean | undefined
          const { container } = render(() => show($visible, () => {
            const el = createElement('div')('content')

            effect(() => () => {
              connected = el.isConnected
            })

            return el
          }))

          expect(container.innerHTML).toBe('<div><div>content</div></div>')

          $visible(false)

          expect(connected).toBe(true)
        })

        it('should apply an inner toggle flipped while the outer is hidden', () => {
          const $outer = signal(true)
          const $inner = signal(false)
          const log: string[] = []
          const { container } = render(() => show($outer, () => createElement('div')(
            'outer',
            show($inner, () => {
              effect(() => {
                log.push('inner effect')
              })

              return createElement('span')('inner')
            })
          )))

          $outer(false)
          $inner(true)

          expect(log).toEqual([])

          $outer(true)

          expect(container.innerHTML).toBe('<div><div>outer<span>inner</span></div></div>')
          expect(log).toEqual(['inner effect'])

          $outer(false)
          $inner(false)
          $outer(true)

          expect(container.innerHTML).toBe('<div><div>outer</div></div>')
          expect(log).toEqual(['inner effect'])
        })
      })
    })
  })
})
