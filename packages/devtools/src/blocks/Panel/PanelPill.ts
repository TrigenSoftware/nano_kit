import {
  signal,
  untracked,
  when,
  inject
} from 'nanoviews/store'
import {
  component$,
  effect$
} from 'nanoviews'
import { LogStore$ } from '../../stores/log.js'
import { PanelStore$ } from '../../stores/panel.js'
import { Icon } from '../../uikit/Icon/index.js'
import { Beacon } from '../../uikit/Beacon/index.js'
import {
  Pill,
  PillSeparator
} from '../../uikit/Pill/index.js'
import { pillAt } from './geometry.js'
import {
  HOTKEY,
  hotkeyLabel
} from './hotkey.js'
import styles from './Panel.module.css'

// How far the pointer goes before a press becomes a drag, in pixels
const DRAG_START = 3

export interface PanelPillProps {
  onOpen(): void
}

/**
 * The collapsed panel: a pill on the bottom edge that opens the window, dragged along the edge to where it
 * is out of the way. Its beacon pulses with every transaction of the application.
 */
export const PanelPill = component$(({ onOpen }: PanelPillProps) => {
  const {
    $pill,
    placePill
  } = inject(PanelStore$)
  const { $groups } = inject(LogStore$)
  const $element = signal<HTMLButtonElement | null>(null)
  const $dragging = signal(false)
  const $pulse = signal(false)
  // The newest transaction: a pulse for each one that comes after it
  const $newest = () => $groups()[0]?.id
  const seen = {
    newest: untracked($newest)
  }
  // The press being dragged, and whether it went far enough to be a drag rather than a click
  const drag = {
    pointer: -1,
    from: 0,
    middle: 0,
    half: 0,
    moved: false
  }

  effect$(() => {
    const newest = $newest()

    if (newest !== seen.newest) {
      seen.newest = newest
      $pulse(true)
    }
  })

  return (
    Pill({
      class: [styles.pill, when($dragging, styles.raised)],
      label: 'Open nano_kit devtools',
      title: `Open nano_kit devtools (${hotkeyLabel()})`,
      'aria-keyshortcuts': HOTKEY,
      dragging: $dragging,
      ref: $element,
      style: () => ({
        '--pillAt': $pill()
      }),
      onPointerDown(event) {
        if (event.button === 0) {
          const element = $element()!
          const {
            left,
            width
          } = element.getBoundingClientRect()

          drag.pointer = event.pointerId
          drag.from = event.clientX
          drag.middle = left + width / 2
          drag.half = width / 2
          drag.moved = false
          element.setPointerCapture(event.pointerId)
        }
      },
      onPointerMove(event) {
        const dx = event.clientX - drag.from

        if (event.pointerId === drag.pointer && (drag.moved || Math.abs(dx) > DRAG_START)) {
          drag.moved = true
          $dragging(true)
          placePill(pillAt(drag.middle + dx, drag.half, document.documentElement.clientWidth))
        }
      },
      onPointerUp(event) {
        if (event.pointerId === drag.pointer) {
          drag.pointer = -1
          $dragging(false)
        }
      },
      onPointerCancel(event) {
        if (event.pointerId === drag.pointer) {
          drag.pointer = -1
          drag.moved = false
          $dragging(false)
        }
      },
      onClick() {
        // The click that ends a drag opens nothing
        if (drag.moved) {
          drag.moved = false
        } else {
          onOpen()
        }
      }
    })(
      Icon({
        name: 'spark'
      }),
      'nano_kit',
      PillSeparator(),
      Beacon({
        active: $pulse,
        onAnimationEnd() {
          $pulse(false)
        }
      })
    )
  )
})
