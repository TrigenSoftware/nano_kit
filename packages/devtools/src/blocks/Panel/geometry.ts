import type { PanelFrame } from '../../stores/panel.js'

/**
 * The least width the window can be dragged to, in pixels.
 */
export const MIN_WIDTH = 640

/**
 * The least height the window can be dragged to, in pixels.
 */
export const MIN_HEIGHT = 360

/**
 * The size of the viewport a fixed box is placed in, scrollbars left out, in pixels.
 */
export interface Viewport {
  readonly width: number
  readonly height: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

/**
 * The frame a box has on the screen: the one it is shown in, whatever frame it was given.
 * @param element - The box.
 * @param viewport - The viewport it is placed in.
 * @returns The frame.
 */
export function frameOf(element: Element, viewport: Viewport): PanelFrame {
  const {
    right,
    bottom,
    width,
    height
  } = element.getBoundingClientRect()

  return {
    right: viewport.width - right,
    bottom: viewport.height - bottom,
    width,
    height
  }
}

/**
 * Where a window goes when its bar is dragged: it moves as a whole, and no further than the edges of the viewport.
 * @param from - The frame the drag began with.
 * @param dx - How far the pointer went to the right.
 * @param dy - How far the pointer went down.
 * @param viewport - The viewport.
 * @returns The frame.
 */
export function moveFrame(from: PanelFrame, dx: number, dy: number, viewport: Viewport): PanelFrame {
  return {
    ...from,
    right: clamp(from.right - dx, 0, viewport.width - from.width),
    bottom: clamp(from.bottom - dy, 0, viewport.height - from.height)
  }
}

/**
 * The size a window gets when its corner is dragged: the top left corner stays, and the size keeps between
 * the least one and the edges of the viewport.
 * @param from - The frame the drag began with.
 * @param dx - How far the pointer went to the right.
 * @param dy - How far the pointer went down.
 * @param viewport - The viewport.
 * @returns The frame.
 */
export function resizeFrame(from: PanelFrame, dx: number, dy: number, viewport: Viewport): PanelFrame {
  const left = viewport.width - from.right - from.width
  const top = viewport.height - from.bottom - from.height
  const width = clamp(from.width + dx, MIN_WIDTH, viewport.width - left)
  const height = clamp(from.height + dy, MIN_HEIGHT, viewport.height - top)

  return {
    right: viewport.width - left - width,
    bottom: viewport.height - top - height,
    width,
    height
  }
}

/**
 * Where the pill goes when it is dragged along the bottom edge: all of it stays in sight.
 * @param middle - Where its middle was dragged to, in pixels from the left edge.
 * @param half - Half its width.
 * @param width - The width of the viewport.
 * @returns Its middle, a share of the width of the viewport.
 */
export function pillAt(middle: number, half: number, width: number) {
  return clamp(middle, half, width - half) / width
}
