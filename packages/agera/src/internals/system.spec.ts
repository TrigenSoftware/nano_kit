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
  effectScope,
  untracked,
  batch
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

      describe('signal', () => {
        it('should warn about a write inside a computed', () => {
          const $count = signal(0)
          const $bad = computed(() => {
            $count(1)

            return 1
          })

          $bad()

          expect(warn).toHaveBeenCalledTimes(1)
          expect(warn).toHaveBeenCalledWith(expect.stringContaining('computed'))
        })

        it('should not warn about a write inside an effect, a scope or untracked', () => {
          const $count = signal(0)
          const $double = computed(() => untracked(() => {
            $count(1)

            return $count() * 2
          }))
          const stop = effect(() => {
            $count(2)
          })
          const stopScope = effectScope(() => {
            $count(3)
          })

          $double()
          stop()
          stopScope()

          expect(warn).not.toHaveBeenCalled()
        })

        it('should not warn about a write inside an effect that was notified', () => {
          const $a = signal(0)
          const $b = signal(0)
          const stop = effect(() => {
            effect(() => {
              $a()
            })
            batch(() => {
              $a(1)
              $b(1)
            })
          })

          stop()

          expect(warn).not.toHaveBeenCalled()
        })
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
