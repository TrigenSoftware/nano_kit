import {
  signal,
  is,
  inject
} from 'nanoviews/store'
import {
  div,
  span,
  fragment,
  component$,
  if_,
  show_
} from 'nanoviews'
import { LogStore$ } from '../../stores/log.js'
import {
  DEFAULT_FRAME,
  PanelStore$
} from '../../stores/panel.js'
import typography from '../../uikit/typography.module.css'
import { Icon } from '../../uikit/Icon/index.js'
import { IconButton } from '../../uikit/IconButton/index.js'
import { Input } from '../../uikit/Input/index.js'
import {
  Tab,
  Tabs
} from '../../uikit/Tabs/index.js'
import {
  Window,
  WindowBar,
  WindowBarStart,
  WindowBarCenter,
  WindowBarEnd,
  WindowBody,
  WindowGrip
} from '../../uikit/Window/index.js'
import { SignalsTable } from '../SignalsTable/index.js'
import { Log } from '../Log/index.js'
import { Inspector } from '../Inspector/index.js'
import {
  frameOf,
  moveFrame,
  resizeFrame
} from './geometry.js'
import {
  HOTKEY,
  hotkeyLabel
} from './hotkey.js'
import styles from './Panel.module.css'

export interface PanelWindowProps {
  onClose(): void
}

// The viewport a fixed box is placed in: the width and the height of the page without its scrollbars
function viewport() {
  const {
    clientWidth,
    clientHeight
  } = document.documentElement

  return {
    width: clientWidth,
    height: clientHeight
  }
}

// What a press on the bar goes to rather than to a drag of the window
function isControl(target: EventTarget | null) {
  return target instanceof Element && target.closest('button, input, label') !== null
}

/**
 * The open panel: a window over the page with the Signals and Log tabs, the filter, the log controls and the
 * boxes of the selected node under either tab. Dragged by its bar, resized by its corner, collapsed by its
 * close button or by Escape while the focus is inside it.
 */
export const PanelWindow = component$(({ onClose }: PanelWindowProps) => {
  const {
    $tab,
    $light,
    $frame,
    $filter,
    switchTheme,
    placeWindow
  } = inject(PanelStore$)
  const {
    $paused,
    pause,
    resume,
    clear
  } = inject(LogStore$)
  const $box = signal<HTMLDivElement | null>(null)
  // The press being dragged: the pointer, where it began, the frame it began with, and whether it resizes
  const drag = {
    pointer: -1,
    x: 0,
    y: 0,
    from: DEFAULT_FRAME,
    resize: false
  }
  const begin = (event: PointerEvent, resize: boolean) => {
    drag.pointer = event.pointerId
    drag.x = event.clientX
    drag.y = event.clientY
    drag.from = frameOf($box()!, viewport())
    drag.resize = resize
    $box()!.setPointerCapture(event.pointerId)
  }
  const move = (event: PointerEvent) => {
    if (event.pointerId === drag.pointer) {
      placeWindow((drag.resize ? resizeFrame : moveFrame)(
        drag.from,
        event.clientX - drag.x,
        event.clientY - drag.y,
        viewport()
      ))
    }
  }
  const end = (event: PointerEvent) => {
    if (event.pointerId === drag.pointer) {
      drag.pointer = -1
    }
  }

  return (
    div({
      class: styles.frame,
      ref: $box,
      style: () => {
        const {
          right,
          bottom,
          width,
          height
        } = $frame()

        return {
          '--sizePanelRight': `${right}px`,
          '--sizePanelBottom': `${bottom}px`,
          '--sizePanelWidth': `${width}px`,
          '--sizePanelHeight': `${height}px`
        }
      },
      onPointerMove: move,
      onPointerUp: end,
      onPointerCancel: end
    })(
      Window({
        label: 'nano_kit devtools',
        tabIndex: -1,
        onKeyDown(event) {
          if (event.key === 'Escape') {
            // Escape in the filter empties it first, the next one closes the window
            if (event.target instanceof HTMLInputElement && event.target.type === 'search' && $filter()) {
              $filter('')
            } else {
              onClose()
            }
          }
        }
      })(
        WindowBar({
          onPointerDown(event) {
            if (event.button === 0 && !isControl(event.target)) {
              begin(event, false)
            }
          }
        })(
          WindowBarStart()(
            Icon({
              name: 'spark'
            }),
            span({
              class: typography.strong
            })(
              'nano_kit'
            ),
            span({
              class: typography.secondary
            })(
              'devtools'
            )
          ),
          WindowBarCenter()(
            Tabs({
              label: 'View',
              $value: $tab
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
              )
            )
          ),
          WindowBarEnd()(
            div({
              class: styles.filter
            })(
              Input({
                type: 'search',
                name: 'filter',
                placeholder: 'Filter by name, file or value',
                'aria-label': 'Filter',
                value: $filter
              })
            ),
            if_(is($tab, 'log'))(
              () => fragment(
                // The button tells what a press does: pause the log, or play it on while paused
                IconButton({
                  label: () => ($paused() ? 'Resume the log' : 'Pause the log'),
                  onClick() {
                    if ($paused()) {
                      resume()
                    } else {
                      pause()
                    }
                  }
                })(
                  Icon({
                    name: () => ($paused() ? 'play' : 'pause')
                  })
                ),
                IconButton({
                  label: 'Clear the log',
                  onClick: clear
                })(
                  Icon({
                    name: 'clear'
                  })
                )
              )
            ),
            IconButton({
              label: () => ($light() ? 'Switch to the dark theme' : 'Switch to the light theme'),
              onClick: switchTheme
            })(
              Icon({
                name: () => ($light() ? 'moon' : 'sun')
              })
            ),
            IconButton({
              label: 'Close',
              title: `Close (${hotkeyLabel()})`,
              'aria-keyshortcuts': HOTKEY,
              onClick: onClose
            })(
              Icon({
                name: 'close'
              })
            )
          )
        ),
        WindowBody()(
          // A tab is set aside while another one is open, not built again: what was opened in it stays open
          show_(is($tab, 'signals'), () => SignalsTable()),
          show_(is($tab, 'log'), () => Log()),
          Inspector({
            class: styles.inspector
          })
        ),
        WindowGrip({
          onPointerDown(event) {
            if (event.button === 0) {
              begin(event, true)
            }
          }
        })
      )
    )
  )
})
