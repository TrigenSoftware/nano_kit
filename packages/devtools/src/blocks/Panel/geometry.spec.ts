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
          it('should resize the window from its corner, keeping its top left corner', () => {
            expect(resizeFrame(FRAME, -300, -100, VIEWPORT)).toEqual({
              right: 320,
              bottom: 120,
              width: 740,
              height: 500
            })
          })

          it('should keep the window to its least size', () => {
            expect(resizeFrame(FRAME, -5000, -5000, VIEWPORT)).toMatchObject({
              width: MIN_WIDTH,
              height: MIN_HEIGHT
            })
          })

          it('should keep the window in the viewport', () => {
            expect(resizeFrame(FRAME, 5000, 5000, VIEWPORT)).toEqual({
              right: 0,
              bottom: 0,
              width: 1060,
              height: 620
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
