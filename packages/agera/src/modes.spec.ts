import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import {
  computed,
  signal,
  onMounted,
  effect,
  trigger,
  mountable,
  isMountable,
  readonly,
  isWritable,
  unsafeMarkWritable
} from './index.js'

describe('agera', () => {
  describe('modes', () => {
    describe('readonly', () => {
      it('should mark signal as readonly', () => {
        const $num = signal(0)
        const $readonlyNum = readonly(signal(0))

        expect(isWritable($num)).toBe(true)
        expect(isWritable($readonlyNum)).toBe(false)
      })

      it('should unsafe mark signal as readonly', () => {
        const $num = computed(() => 0)

        expect(isWritable($num)).toBe(false)

        unsafeMarkWritable($num)

        expect(isWritable($num)).toBe(true)
      })
    })

    describe('mountable', () => {
      it('should detect mountable signals', () => {
        expect(isMountable(mountable(signal(0)))).toBe(true)
      })

      it('should trigger onMounted callback', () => {
        const $num = mountable(signal(0))
        const log: string[] = []

        onMounted($num, (mounted) => {
          log.push(mounted ? 'mount' : 'unmount')
        })

        expect(log).toEqual([])

        const stop = effect(() => {
          $num()
          log.push('effect')
        })

        expect(log).toEqual(['effect', 'mount'])

        stop()

        expect(log).toEqual([
          'effect',
          'mount',
          'unmount'
        ])
      })

      it('should not desync subs count when signal is read by non-subscriber node', () => {
        const $num = mountable(signal(1))
        const log: string[] = []

        onMounted($num, (mounted) => {
          log.push(mounted ? 'mount' : 'unmount')
        })

        const stop = effect(() => {
          $num()
        })

        expect($num.node.subsCount).toBe(1)
        expect(log).toEqual(['mount'])

        trigger($num)

        expect($num.node.subsCount).toBe(1)
        expect(log).toEqual(['mount'])

        stop()

        expect($num.node.subsCount).toBe(0)
        expect(log).toEqual(['mount', 'unmount'])
      })

      it('should propagate changes from onMounted callback', () => {
        const $a = mountable(signal(1))
        const log: string[] = []

        onMounted($a, (mounted) => {
          log.push(mounted ? 'a mount' : 'a unmount')

          if (mounted) {
            $a(2)
          }
        })

        const listener = vi.fn(() => {
          log.push(`effect ${$a()}`)
        })
        const stop = effect(listener)

        expect(log).toEqual([
          'effect 1',
          'a mount',
          'effect 2'
        ])
        log.length = 0

        expect(listener).toHaveBeenCalledTimes(2)

        stop()

        expect(log).toEqual(['a unmount'])
      })

      it('should propagate changes from transitive onMounted callback', () => {
        const $a = mountable(signal(1))
        const $b = mountable(computed(() => {
          const v = `${$a() + 1}`

          log.push(`computed ${v}`)

          return v
        }))
        const log: string[] = []

        onMounted($a, (mounted) => {
          log.push(mounted ? 'a mount' : 'a unmount')
        })

        onMounted($b, (mounted) => {
          log.push(mounted ? 'b mount' : 'b unmount')

          if (mounted) {
            $a(2)
          }
        })

        const listener = vi.fn(() => {
          log.push(`effect ${$b()}`)
        })
        const stop = effect(listener)

        expect(log).toEqual([
          'computed 2',
          'effect 2',
          'a mount',
          'b mount',
          'computed 3',
          'effect 3'
        ])
        log.length = 0

        expect(listener).toHaveBeenCalledTimes(2)

        stop()

        expect(log).toEqual(['b unmount', 'a unmount'])
      })

      it('should propagate changes from onMounted callback to itself', () => {
        const $a = mountable(signal(1))
        const $b = mountable(computed(() => {
          const v = `${$a() + 1}`

          log.push(`computed ${v}`)

          return v
        }))
        const log: string[] = []

        onMounted($a, (mounted) => {
          log.push(mounted ? 'a mount' : 'a unmount')

          if (mounted) {
            $a(2)
          }
        })

        const listener = vi.fn(() => {
          log.push(`effect ${$b()}`)
        })
        const stop = effect(listener)

        expect(log).toEqual([
          'computed 2',
          'effect 2',
          'a mount',
          'computed 3',
          'effect 3'
        ])

        expect(listener).toHaveBeenCalledTimes(2)

        stop()
      })

      it('should not trigger dependency activation by cold computed', () => {
        const $src = mountable(signal(0))
        const listener = vi.fn()

        onMounted($src, listener)

        const $double = computed(() => $src() * 2)

        $double()

        expect(listener).not.toHaveBeenCalled()

        effect(() => {
          $double()
        })()

        expect(listener.mock.calls).toEqual([[true], [false]])
      })

      it('should handle conditional computed dependencies', () => {
        const $a = mountable(signal(1))
        const $b = mountable(signal(2))
        const $c = mountable(signal(true))
        const $d = mountable(computed(() => ($c() ? $a() : $b()) * 2))
        const aListener = vi.fn()
        const bListener = vi.fn()
        const cListener = vi.fn()
        const dListener = vi.fn()

        onMounted($a, aListener)
        onMounted($b, bListener)
        onMounted($c, cListener)
        onMounted($d, dListener)

        $d()

        expect(aListener).not.toHaveBeenCalled()
        expect(bListener).not.toHaveBeenCalled()
        expect(cListener).not.toHaveBeenCalled()
        expect(dListener).not.toHaveBeenCalled()

        $c(false)

        expect(aListener).not.toHaveBeenCalled()
        expect(bListener).not.toHaveBeenCalled()
        expect(cListener).not.toHaveBeenCalled()
        expect(dListener).not.toHaveBeenCalled()

        const stop = effect(() => {
          $d()
        })

        expect(aListener.mock.calls).toEqual([])
        expect(bListener.mock.calls).toEqual([[true]])
        expect(cListener.mock.calls).toEqual([[true]])
        expect(dListener.mock.calls).toEqual([[true]])

        $c(true)

        expect(aListener.mock.calls).toEqual([[true]])
        expect(bListener.mock.calls).toEqual([[true], [false]])
        expect(cListener.mock.calls).toEqual([[true]])
        expect(dListener.mock.calls).toEqual([[true]])

        $d()

        expect(aListener.mock.calls).toEqual([[true]])
        expect(bListener.mock.calls).toEqual([[true], [false]])
        expect(cListener.mock.calls).toEqual([[true]])
        expect(dListener.mock.calls).toEqual([[true]])

        stop()

        expect(aListener.mock.calls).toEqual([[true], [false]])
        expect(bListener.mock.calls).toEqual([[true], [false]])
        expect(cListener.mock.calls).toEqual([[true], [false]])
        expect(dListener.mock.calls).toEqual([[true], [false]])
      })

      it('should handle different subscribers types', () => {
        const $value = mountable(signal(1))
        const $coldUse = signal(true)
        const $cold = mountable(computed(() => ($coldUse() ? $value() * 2 : -1)))
        const $hotUse = signal(true)
        const $hot = mountable(computed(() => ($hotUse() ? $value() * 2 : -1)))
        const valueListener = vi.fn()
        const coldListener = vi.fn()
        const hotListener = vi.fn()

        onMounted($value, valueListener)
        onMounted($cold, coldListener)
        onMounted($hot, hotListener)

        $cold()

        expect(valueListener).toHaveBeenCalledTimes(0)
        expect(coldListener).toHaveBeenCalledTimes(0)
        expect(hotListener).toHaveBeenCalledTimes(0)

        $coldUse(false)

        expect(valueListener).toHaveBeenCalledTimes(0)
        expect(coldListener).toHaveBeenCalledTimes(0)
        expect(hotListener).toHaveBeenCalledTimes(0)

        const stop = effect(() => {
          $hot()
        })

        expect(valueListener.mock.calls).toEqual([[true]])
        expect(coldListener).toHaveBeenCalledTimes(0)
        expect(hotListener.mock.calls).toEqual([[true]])

        $coldUse(true)

        expect(valueListener.mock.calls).toEqual([[true]])
        expect(coldListener).toHaveBeenCalledTimes(0)
        expect(hotListener.mock.calls).toEqual([[true]])

        $coldUse(false)

        expect(valueListener.mock.calls).toEqual([[true]])
        expect(coldListener).toHaveBeenCalledTimes(0)
        expect(hotListener.mock.calls).toEqual([[true]])

        $hotUse(false)

        expect(valueListener.mock.calls).toEqual([[true], [false]])
        expect(coldListener).toHaveBeenCalledTimes(0)
        expect(hotListener.mock.calls).toEqual([[true]])

        $coldUse(true)

        expect(valueListener.mock.calls).toEqual([[true], [false]])
        expect(coldListener).toHaveBeenCalledTimes(0)
        expect(hotListener.mock.calls).toEqual([[true]])

        stop()

        expect(valueListener.mock.calls).toEqual([[true], [false]])
        expect(coldListener).toHaveBeenCalledTimes(0)
        expect(hotListener.mock.calls).toEqual([[true], [false]])
      })

      it('should handle nested computeds', () => {
        const $a = mountable(signal(1))
        const $useA = mountable(signal(true))
        const $computedA = mountable(computed(() => ($useA() ? $a() : 1) * 2))
        const $b = mountable(signal(10))
        const $computedB = mountable(computed(() => $computedA() * $b()))
        const $c = mountable(signal(100))
        const $computedC = mountable(computed(() => $computedB() + $c()))
        const aListener = vi.fn()
        const useAListener = vi.fn()
        const bListener = vi.fn()
        const cListener = vi.fn()
        const computedAListener = vi.fn()
        const computedBListener = vi.fn()
        const computedCListener = vi.fn()

        onMounted($a, aListener)
        onMounted($useA, useAListener)
        onMounted($b, bListener)
        onMounted($c, cListener)
        onMounted($computedA, computedAListener)
        onMounted($computedB, computedBListener)
        onMounted($computedC, computedCListener)

        const stop = effect(() => {
          $computedC()
        })

        expect(aListener.mock.calls).toEqual([[true]])
        expect(useAListener.mock.calls).toEqual([[true]])
        expect(bListener.mock.calls).toEqual([[true]])
        expect(cListener.mock.calls).toEqual([[true]])
        expect(computedAListener.mock.calls).toEqual([[true]])
        expect(computedBListener.mock.calls).toEqual([[true]])
        expect(computedCListener.mock.calls).toEqual([[true]])

        $useA(false)

        expect(aListener.mock.calls).toEqual([[true], [false]])
        expect(useAListener.mock.calls).toEqual([[true]])
        expect(bListener.mock.calls).toEqual([[true]])
        expect(cListener.mock.calls).toEqual([[true]])
        expect(computedAListener.mock.calls).toEqual([[true]])
        expect(computedBListener.mock.calls).toEqual([[true]])
        expect(computedCListener.mock.calls).toEqual([[true]])

        $useA(true)

        expect(aListener.mock.calls).toEqual([
          [true],
          [false],
          [true]
        ])
        expect(useAListener.mock.calls).toEqual([[true]])
        expect(bListener.mock.calls).toEqual([[true]])
        expect(cListener.mock.calls).toEqual([[true]])
        expect(computedAListener.mock.calls).toEqual([[true]])
        expect(computedBListener.mock.calls).toEqual([[true]])
        expect(computedCListener.mock.calls).toEqual([[true]])

        stop()

        expect(aListener.mock.calls).toEqual([
          [true],
          [false],
          [true],
          [false]
        ])
        expect(useAListener.mock.calls).toEqual([[true], [false]])
        expect(bListener.mock.calls).toEqual([[true], [false]])
        expect(cListener.mock.calls).toEqual([[true], [false]])
        expect(computedAListener.mock.calls).toEqual([[true], [false]])
        expect(computedBListener.mock.calls).toEqual([[true], [false]])
        expect(computedCListener.mock.calls).toEqual([[true], [false]])
      })

      it('should handle diamond dependency graph', () => {
        const $a = mountable(signal(1))
        const $b = mountable(computed(() => $a() * 2))
        const $c = mountable(computed(() => $a() * 3))
        const $d = mountable(computed(() => $b() + $c()))
        const aListener = vi.fn()
        const bListener = vi.fn()
        const cListener = vi.fn()
        const dListener = vi.fn()

        onMounted($a, aListener)
        onMounted($b, bListener)
        onMounted($c, cListener)
        onMounted($d, dListener)

        const stop = effect(() => {
          $d()
        })

        expect($a.node.subsCount).toBe(2)
        expect(aListener.mock.calls).toEqual([[true]])
        expect(bListener.mock.calls).toEqual([[true]])
        expect(cListener.mock.calls).toEqual([[true]])
        expect(dListener.mock.calls).toEqual([[true]])

        stop()

        expect($a.node.subsCount).toBe(0)
        expect(aListener.mock.calls).toEqual([[true], [false]])
        expect(bListener.mock.calls).toEqual([[true], [false]])
        expect(cListener.mock.calls).toEqual([[true], [false]])
        expect(dListener.mock.calls).toEqual([[true], [false]])
      })

      it('should handle several effects on same computed', () => {
        const $a = mountable(signal(1))
        const $b = mountable(computed(() => $a() * 2))
        const aListener = vi.fn()
        const bListener = vi.fn()

        onMounted($a, aListener)
        onMounted($b, bListener)

        const stop1 = effect(() => {
          $b()
        })
        const stop2 = effect(() => {
          $b()
        })

        expect($a.node.subsCount).toBe(2)
        expect(aListener.mock.calls).toEqual([[true]])
        expect(bListener.mock.calls).toEqual([[true]])

        stop1()

        expect($a.node.subsCount).toBe(1)
        expect(aListener.mock.calls).toEqual([[true]])
        expect(bListener.mock.calls).toEqual([[true]])

        stop2()

        expect($a.node.subsCount).toBe(0)
        expect(aListener.mock.calls).toEqual([[true], [false]])
        expect(bListener.mock.calls).toEqual([[true], [false]])
      })

      it('should not dead lock signal mounted state', () => {
        const $value = mountable(signal(0))
        const events: string[] = []
        let destroy: (() => void) | undefined
        const callback = (mounted: boolean) => {
          if (destroy) {
            destroy()
            destroy = undefined
          }

          events.push(`onMounted callback ${mounted}`)

          if (mounted) {
            destroy = effect(() => {
              events.push(`mount effect ${$value()}`)

              return () => events.push('mount effect destroy')
            })
          }
        }
        const stop = onMounted($value, callback)

        expect(events).toEqual([])
        expect($value.node.subsCount).toBe(0)

        const stopEffect = effect(() => {
          events.push(`effect ${$value()}`)
        })

        expect(events).toEqual([
          'effect 0',
          'onMounted callback true',
          'mount effect 0'
        ])
        expect($value.node.subsCount).toBe(1)
        events.length = 0

        $value(2)

        expect(events).toEqual([
          'effect 2',
          'mount effect destroy',
          'mount effect 2'
        ])
        expect($value.node.subsCount).toBe(1)
        events.length = 0

        const stopEffect2 = effect(() => {
          events.push(`effect 2 ${$value()}`)
        })

        expect(events).toEqual(['effect 2 2'])
        expect($value.node.subsCount).toBe(2)
        events.length = 0

        stopEffect()
        expect(events).toEqual([])
        expect($value.node.subsCount).toBe(1)

        stopEffect2()
        expect(events).toEqual([
          'mount effect destroy',
          'onMounted callback false'
        ])
        expect($value.node.subsCount).toBe(0)
        events.length = 0

        stop()
        expect(events).toEqual([])
        expect($value.node.subsCount).toBe(0)
      })
    })
  })
})
