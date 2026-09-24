import {
  describe,
  it,
  expect,
  beforeEach
} from 'vitest'
import {
  render,
  screen,
  fireEvent
} from '@nanoviews/testing-library'
import { composeStory } from '@nanoviews/storybook'
import {
  type InjectionContext,
  getContext,
  inject
} from '@nano_kit/store'
import { PanelStore$ } from '../../stores/panel.js'
import {
  Cart$,
  withMockApp
} from '../shared/app.mock.js'
import { Panel } from './Panel.js'

// The panel over the application of the stories, a new one for each test, on the settings of a new page
async function setup() {
  let context!: InjectionContext
  const Story = composeStory({
    render() {
      context = getContext()!

      return Panel()
    }
  }, {
    decorators: [withMockApp()]
  })

  render(Story())

  // The events of the application come a microtask after it started
  await Promise.resolve()

  return context
}

function pill() {
  return screen.queryByRole('button', {
    name: 'Open nano_kit devtools'
  })
}

function panelWindow() {
  return screen.queryByRole('dialog', {
    name: 'nano_kit devtools'
  })
}

// Alt+Shift+D where the focus is: on a Mac, Option makes another letter of the key
function toggle(target: Element) {
  fireEvent.keyDown(target, {
    code: 'KeyD',
    key: 'Î',
    altKey: true,
    shiftKey: true
  })
}

describe('devtools', () => {
  describe('blocks', () => {
    describe('Panel', () => {
      beforeEach(() => {
        localStorage.clear()
      })

      it('should open the window from the pill and give it the focus', async () => {
        await setup()

        fireEvent.click(pill()!)

        expect(pill()).toBeNull()
        expect(document.activeElement).toBe(panelWindow())
      })

      it('should collapse the window from its close button and give the focus to the pill', async () => {
        await setup()

        fireEvent.click(pill()!)
        fireEvent.click(screen.getByRole('button', {
          name: 'Close'
        }))

        expect(panelWindow()).toBeNull()
        expect(document.activeElement).toBe(pill())
      })

      it('should collapse the window on Escape while the focus is inside it', async () => {
        await setup()

        fireEvent.click(pill()!)
        fireEvent.keyDown(panelWindow()!, {
          key: 'Escape'
        })

        expect(panelWindow()).toBeNull()
      })

      it('should leave the window open on Escape elsewhere on the page', async () => {
        await setup()

        fireEvent.click(pill()!)
        fireEvent.keyDown(document.body, {
          key: 'Escape'
        })

        expect(panelWindow()).not.toBeNull()
      })

      it('should empty the filter on Escape before it collapses the window', async () => {
        await setup()

        fireEvent.click(pill()!)

        const filter = screen.getByRole<HTMLInputElement>('searchbox', {
          name: 'Filter'
        })

        fireEvent.input(filter, {
          target: {
            value: 'cart'
          }
        })
        fireEvent.keyDown(filter, {
          key: 'Escape'
        })

        expect(filter.value).toBe('')
        expect(panelWindow()).not.toBeNull()

        fireEvent.keyDown(filter, {
          key: 'Escape'
        })

        expect(panelWindow()).toBeNull()
      })

      it('should open and collapse on Alt+Shift+D from anywhere on the page', async () => {
        await setup()

        toggle(document.body)

        expect(panelWindow()).not.toBeNull()

        toggle(panelWindow()!)

        expect(pill()).not.toBeNull()
        expect(document.activeElement).toBe(pill())
      })

      it('should leave the focus on the page when collapsed from there', async () => {
        const context = await setup()
        const field = document.createElement('input')

        inject(PanelStore$, context).open()
        document.body.append(field)
        field.focus()
        toggle(field)

        expect(pill()).not.toBeNull()
        expect(document.activeElement).toBe(field)

        field.remove()
      })

      it('should hint the shortcut on the pill and on the close button', async () => {
        await setup()

        expect(pill()!.title).toBe('Open nano_kit devtools (Alt+Shift+D)')
        expect(pill()!.getAttribute('aria-keyshortcuts')).toBe('Alt+Shift+D')

        fireEvent.click(pill()!)

        const close = screen.getByRole('button', {
          name: 'Close'
        })

        expect(close.title).toBe('Close (Alt+Shift+D)')
        expect(close.getAttribute('aria-keyshortcuts')).toBe('Alt+Shift+D')
      })

      it('should show the controls of the log on the Log tab alone', async () => {
        await setup()

        fireEvent.click(pill()!)

        expect(screen.queryByRole('button', {
          name: 'Pause the log'
        })).toBeNull()

        fireEvent.click(screen.getByRole('radio', {
          name: 'Log'
        }))

        expect(screen.getByRole('button', {
          name: 'Pause the log'
        })).toBeDefined()
        expect(screen.getByRole('button', {
          name: 'Clear the log'
        })).toBeDefined()
      })

      it('should turn the pause button into a play button while the log is paused', async () => {
        await setup()

        fireEvent.click(pill()!)
        fireEvent.click(screen.getByRole('radio', {
          name: 'Log'
        }))
        fireEvent.click(screen.getByRole('button', {
          name: 'Pause the log'
        }))

        const resume = screen.getByRole('button', {
          name: 'Resume the log'
        })

        expect(resume.querySelector('use')?.getAttribute('href')).toMatch(/#play$/)

        fireEvent.click(resume)

        expect(screen.getByRole('button', {
          name: 'Pause the log'
        }).querySelector('use')?.getAttribute('href')).toMatch(/#pause$/)
      })

      it('should keep what was opened in a tab after a visit to another one', async () => {
        const context = await setup()

        fireEvent.click(pill()!)
        fireEvent.click(screen.getByRole('radio', {
          name: 'Log'
        }))
        inject(Cart$, context).tick()

        await Promise.resolve()

        fireEvent.click(screen.getAllByRole('row', {
          expanded: false
        })[0])
        fireEvent.click(screen.getByRole('radio', {
          name: 'Signals'
        }))
        fireEvent.click(screen.getByRole('radio', {
          name: 'Log'
        }))

        expect(screen.queryAllByRole('row', {
          expanded: true
        })).toHaveLength(1)
      })

      it('should pulse the beacon of the pill with every transaction of the application', async () => {
        const context = await setup()
        const beacon = pill()!.lastElementChild!

        // The pulse for the start of the application is over
        fireEvent.animationEnd(beacon)

        const rest = beacon.className

        inject(Cart$, context).tick()

        await Promise.resolve()

        expect(beacon.className).not.toBe(rest)
      })
    })
  })
})
