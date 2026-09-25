import {
  describe,
  it,
  expect
} from 'vitest'
import {
  MIN_WIDTH,
  MIN_HEIGHT,
  PILL_SNAP,
  moveFrame,
  resizeFrame,
  pillAt
} from './geometry.js'

const VIEWPORT = {
  width: 1440,
  height: 900
}
const FRAME = {
  right: 20,
  bottom: 20,
  width: 1040,
  height: 600
}

describe('devtools', () => {
  describe('blocks', () => {
    describe('Panel', () => {
      describe('geometry', () => {
        describe('moveFrame', () => {
          it('should move the window with the pointer', () => {
            expect(moveFrame(FRAME, -200, -150, VIEWPORT)).toEqual({
              ...FRAME,
              right: 220,
              bottom: 170
            })
          })

          it('should keep the window in the viewport', () => {
            expect(moveFrame(FRAME, -5000, 5000, VIEWPORT)).toEqual({
              ...FRAME,
              right: 400,
              bottom: 0
            })
          })
        })

        describe('resizeFrame', () => {
          it('should resize the window by its lower right corner, keeping its top left corner', () => {
            expect(resizeFrame(FRAME, -300, -100, VIEWPORT, 'bottomRight')).toEqual({
              right: 320,
              bottom: 120,
              width: 740,
              height: 500
            })
          })

          it('should resize the window by its lower left corner, keeping its top right corner', () => {
            expect(resizeFrame(FRAME, 100, -100, VIEWPORT, 'bottomLeft')).toEqual({
              right: 20,
              bottom: 120,
              width: 940,
              height: 500
            })
          })

          it('should resize the width alone by the left edge, keeping the right one', () => {
            expect(resizeFrame(FRAME, -300, 50, VIEWPORT, 'left')).toEqual({
              ...FRAME,
              width: 1340
            })
          })

          it('should resize the width alone by the right edge, keeping the left one', () => {
            expect(resizeFrame(FRAME, -300, 50, VIEWPORT, 'right')).toEqual({
              ...FRAME,
              right: 320,
              width: 740
            })
          })

          it('should resize the height alone by the bottom edge, keeping the top one', () => {
            expect(resizeFrame(FRAME, 50, -100, VIEWPORT, 'bottom')).toEqual({
              ...FRAME,
              bottom: 120,
              height: 500
            })
          })

          it('should keep the window to its least size', () => {
            expect(resizeFrame(FRAME, -5000, -5000, VIEWPORT, 'bottomRight')).toMatchObject({
              width: MIN_WIDTH,
              height: MIN_HEIGHT
            })
          })

          it('should keep the right edge in place when the left one stops at the least width', () => {
            expect(resizeFrame(FRAME, 5000, 0, VIEWPORT, 'left')).toEqual({
              ...FRAME,
              width: MIN_WIDTH
            })
          })

          it('should keep the window in the viewport', () => {
            expect(resizeFrame(FRAME, 5000, 5000, VIEWPORT, 'bottomRight')).toEqual({
              right: 0,
              bottom: 0,
              width: 1060,
              height: 620
            })
          })

          it('should stop the left edge at the edge of the viewport', () => {
            expect(resizeFrame(FRAME, -5000, 0, VIEWPORT, 'left')).toEqual({
              ...FRAME,
              width: 1420
            })
          })
        })

        describe('pillAt', () => {
          it('should put the middle of the pill where it was dragged to, as a share of the viewport', () => {
            expect(pillAt(360, 60, 1440)).toBe(0.25)
          })

          it('should keep all of the pill in sight', () => {
            expect(pillAt(-100, 60, 1440)).toBe(60 / 1440)
            expect(pillAt(2000, 60, 1440)).toBe(1380 / 1440)
          })

          it('should snap the pill to the middle of the edge when it is dragged near it', () => {
            expect(pillAt(720 - PILL_SNAP, 60, 1440)).toBe(0.5)
            expect(pillAt(720 + PILL_SNAP, 60, 1440)).toBe(0.5)
            expect(pillAt(720 + PILL_SNAP + 1, 60, 1440)).toBe((720 + PILL_SNAP + 1) / 1440)
          })
        })
      })
    })
  })
})
