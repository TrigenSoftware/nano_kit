import {
  BooleanCodec,
  JsonCodec,
  signal,
  action,
  debounce
} from '@nano_kit/store'
import { localStored } from '@nano_kit/platform-web'

/**
 * Where the window sits and how large it is, in pixels: its right and bottom edges are counted from those
 * of the viewport, so it stays in the corner it was put in when the viewport changes.
 */
export interface PanelFrame {
  readonly right: number
  readonly bottom: number
  readonly width: number
  readonly height: number
}

/**
 * The frame of a window nobody has moved yet: in the bottom right corner.
 */
export const DEFAULT_FRAME: PanelFrame = {
  right: 20,
  bottom: 20,
  width: 1040,
  height: 600
}

// The settings of the panel are kept per origin, under the name of the package
const KEY = 'nano_kit.devtools'
// A drag writes to the storage once it rests, in milliseconds
const SETTLE = 300

/**
 * What the panel as a whole is set to: whether the window is open, its tab, theme and frame, where the
 * collapsed pill sits, and the text of the filter field. All but the filter outlive a reload.
 * @returns The store.
 */
export function PanelStore$() {
  const $open = localStored(`${KEY}.open`, false, BooleanCodec)
  // The value of the open tab of the `Tabs`: `signals` or `log`
  const $tab = localStored(`${KEY}.tab`, 'signals' as string)
  const $light = localStored(`${KEY}.light`, false, BooleanCodec)
  const $frame = localStored<PanelFrame>(`${KEY}.frame`, DEFAULT_FRAME, JsonCodec, debounce(SETTLE))
  // The middle of the pill along the bottom edge, a share of the width of the viewport
  const $pill = localStored(`${KEY}.pill`, 0.5, JsonCodec, debounce(SETTLE))
  const $filter = signal('')
  /**
   * Open the window in place of the pill.
   */
  const open = action(() => {
    $open(true)
  })
  /**
   * Collapse the window into the pill.
   */
  const close = action(() => {
    $open(false)
  })
  /**
   * Switch between the dark theme and the light one.
   */
  const switchTheme = action(() => {
    $light(light => !light)
  })
  /**
   * Put the window where it was dragged to, or give it the size it was dragged to.
   */
  const placeWindow = action((frame: PanelFrame) => {
    $frame(frame)
  })
  /**
   * Put the pill where it was dragged to along the bottom edge.
   * @param at - The middle of the pill, a share of the width of the viewport.
   */
  const placePill = action((at: number) => {
    $pill(at)
  })

  return {
    $open,
    $tab,
    $light,
    $frame,
    $pill,
    $filter,
    open,
    close,
    switchTheme,
    placeWindow,
    placePill
  }
}
