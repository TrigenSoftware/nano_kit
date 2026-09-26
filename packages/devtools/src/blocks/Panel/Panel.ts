import {
  signal,
  inject
} from 'nanoviews/store'
import {
  component$,
  effect$,
  if_
} from 'nanoviews'
import { PanelStore$ } from '../../stores/panel.js'
import { Theme } from '../../uikit/Theme/index.js'
import { PanelPill } from './PanelPill.js'
import { PanelWindow } from './PanelWindow.js'
import { isHotkey } from './hotkey.js'

/**
 * The DevTools on the page: a pill on the bottom edge, or the window it opens, in the theme the user picked.
 * Alt+Shift+D opens and collapses it from anywhere on the page.
 */
export const Panel = component$(() => {
  const {
    $open,
    $light,
    open,
    close
  } = inject(PanelStore$)
  const $root = signal<HTMLDivElement | null>(null)
  // The part the user brought up takes the focus, the window or the pill once it is back; never the one a page
  // loads with, and never away from the page while the user works there
  const toggle = (focus: boolean) => {
    if ($open()) {
      close()
    } else {
      open()
    }

    if (focus) {
      $root()!.querySelector<HTMLElement>('[role="dialog"], button')!.focus()
    }
  }

  effect$(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isHotkey(event)) {
        event.preventDefault()
        toggle(!$open() || event.composedPath().includes($root()!))
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  })

  return (
    Theme({
      light: $light,
      ref: $root
    })(
      if_($open)(
        () => PanelWindow({
          onClose() {
            toggle(true)
          }
        }),
        () => PanelPill({
          onOpen() {
            toggle(true)
          }
        })
      )
    )
  )
})
