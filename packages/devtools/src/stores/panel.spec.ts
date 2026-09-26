import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach
} from 'vitest'
import {
  InjectionContext,
  inject
} from '@nano_kit/store'
import {
  DEFAULT_FRAME,
  PanelStore$
} from './panel.js'

// A new page: a new context reads the settings the storage kept
function create() {
  return inject(PanelStore$, new InjectionContext())
}

describe('devtools', () => {
  describe('stores', () => {
    describe('panel', () => {
      describe('PanelStore$', () => {
        beforeEach(() => {
          localStorage.clear()
        })

        afterEach(() => {
          vi.useRealTimers()
        })

        it('should start collapsed, on the Signals tab, dark, with the window in the corner and the pill in the middle', () => {
          const panel = create()

          expect(panel.$open()).toBe(false)
          expect(panel.$tab()).toBe('signals')
          expect(panel.$light()).toBe(false)
          expect(panel.$frame()).toEqual(DEFAULT_FRAME)
          expect(panel.$pill()).toBe(0.5)
        })

        it('should open the window and collapse it', () => {
          const panel = create()

          panel.open()

          expect(panel.$open()).toBe(true)

          panel.close()

          expect(panel.$open()).toBe(false)
        })

        it('should switch the theme', () => {
          const panel = create()

          panel.switchTheme()

          expect(panel.$light()).toBe(true)

          panel.switchTheme()

          expect(panel.$light()).toBe(false)
        })

        it('should keep the window, the tab and the theme across a reload, and not the filter', () => {
          const panel = create()

          panel.open()
          panel.$tab('log')
          panel.switchTheme()
          panel.$filter('cart')

          const reloaded = create()

          expect(reloaded.$open()).toBe(true)
          expect(reloaded.$tab()).toBe('log')
          expect(reloaded.$light()).toBe(true)
          expect(reloaded.$filter()).toBe('')
        })

        it('should keep where the window and the pill were dragged to once the drag rests', () => {
          vi.useFakeTimers()

          const panel = create()
          const frame = {
            ...DEFAULT_FRAME,
            right: 200
          }

          panel.placeWindow(frame)
          panel.placePill(0.25)

          expect(panel.$frame()).toEqual(frame)
          expect(create().$frame()).toEqual(DEFAULT_FRAME)

          vi.runAllTimers()

          const reloaded = create()

          expect(reloaded.$frame()).toEqual(frame)
          expect(reloaded.$pill()).toBe(0.25)
        })
      })
    })
  })
})
