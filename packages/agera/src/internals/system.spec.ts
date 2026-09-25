import {
  type MockInstance,
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach
} from 'vitest'
import {
  signal,
  computed,
  effect,
  effectScope
} from './system.js'

describe('agera', () => {
  describe('internals', () => {
    describe('system', () => {
      let warn: MockInstance

      beforeEach(() => {
        warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      })

      afterEach(() => {
        vi.restoreAllMocks()
      })

      describe('effect', () => {
        it('should warn about an effect created inside a computed', () => {
          const $count = signal(0)
          const $bad = computed(() => {
            stop = effect(() => {
              $count()
            })

            return $count()
          })
          let stop = () => {}

          $bad()
          stop()

          expect(warn).toHaveBeenCalledTimes(1)
          expect(warn).toHaveBeenCalledWith(expect.stringContaining('effect was created'))
        })
      })

      describe('effectScope', () => {
        it('should warn about a scope created inside a computed', () => {
          const $count = signal(0)
          const $bad = computed(() => {
            stop = effectScope(() => {})

            return $count()
          })
          let stop = () => {}

          $bad()
          stop()

          expect(warn).toHaveBeenCalledTimes(1)
          expect(warn).toHaveBeenCalledWith(expect.stringContaining('scope was created'))
        })
      })
    })
  })
})
