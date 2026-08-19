import {
  vi,
  describe,
  it,
  expect,
  expectTypeOf
} from 'vitest'
import {
  type SignalNode,
  batch,
  computed,
  createSignal,
  deferScope,
  effect,
  effectScope,
  isMounted,
  isSignal,
  mountable,
  onMounted,
  selector,
  signal,
  startScope,
  stopScope,
  trigger,
  untracked
} from './index.js'

describe('agera', () => {
  describe('signal', () => {
    it('should set new value by function', () => {
      const $num = signal(0)

      $num(num => num + 1)
      expect($num()).toBe(1)

      $num(num => num + 5)
      expect($num()).toBe(6)
    })

    it('should not subscribe the writing effect to signals read by the reducer', () => {
      const $count = signal(0)
      const $step = signal(1)
      const listener = vi.fn()
      let written = false
      const stop = effect(() => {
        listener($count())

        if (!written) {
          written = true

          $count(count => count + $step())
        }
      })
      const runs = listener.mock.calls.length

      $step(10)

      // the reducer's read must not be a dependency of the writing effect
      expect(listener).toHaveBeenCalledTimes(runs)

      stop()
    })

    it('should notify recursed effect by external update', () => {
      const log: string[] = []
      const $data = signal()
      const $computed = computed(() => {
        log.push('compute')
        return $data()
      })
      const stop = effect(() => {
        log.push('effect')
        $computed()
        $data('test')
      })

      log.push('revalidate')
      $data('TEST')

      expect(log).toEqual([
        'effect',
        'compute',
        'revalidate',
        'compute',
        'effect'
      ])

      stop()
    })

    it('should not rerun an effect that writes its own dependency directly', () => {
      const $tick = signal(0)
      const $data = signal(0)
      let runs = 0
      const stop = effect(() => {
        $tick()

        const data = $data()

        runs++

        $data(data + 1)
      })

      $tick(1)

      expect(runs).toBe(2)
      expect($data()).toBe(2)

      stop()
    })

    it('should settle an effect that feeds itself instead of running away', () => {
      const $tick = signal(0)
      const $data = signal(0)
      let runs = 0
      const stop = effect(() => {
        $tick()

        const data = $data()

        runs++

        untracked(() => $data(data + 1))
      })

      $tick(1)

      expect(runs).toBe(2)
      expect($data()).toBe(2)

      stop()
    })

    describe('computed', () => {
      it('should correctly propagate changes through computed signals', () => {
        const src = signal(0)
        const c1 = computed(() => src() % 2)
        const c2 = computed(() => c1())
        const c3 = computed(() => c2())

        c3()
        src(1) // c1 -> dirty, c2 -> toCheckDirty, c3 -> toCheckDirty
        c2() // c1 -> none, c2 -> none
        src(3) // c1 -> dirty, c2 -> toCheckDirty

        expect(c3()).toBe(1)
      })

      it('should propagate updated source value through chained computations', () => {
        const src = signal(0)
        const a = computed(() => src())
        const b = computed(() => a() % 2)
        const c = computed(() => src())
        const d = computed(() => b() + c())

        expect(d()).toBe(0)
        src(2)
        expect(d()).toBe(2)
      })

      it('should not update if the signal value is reverted', () => {
        let times = 0
        const src = signal(0)
        const c1 = computed(() => {
          times++
          return src()
        })

        c1()
        expect(times).toBe(1)
        src(1)
        src(0)
        c1()
        expect(times).toBe(1)
      })
    })

    describe('selector', () => {
      // One reader per key, stopped together: what a list of rows does to a
      // selector, without a list of rows
      const watchKeys = (
        $selected: (key: number) => boolean,
        keys: number[],
        values: boolean[]
      ) => {
        const stops = keys.map(key => effect(() => {
          values.push($selected(key))
        }))

        return () => stops.forEach(stop => stop())
      }

      it('should return a plain keyed accessor and answer untracked without subscribing', () => {
        const source = mountable(signal(1))
        const mounted = vi.fn()
        const stopMounted = onMounted(source, mounted)
        const $isSelected = selector(source)

        expect('node' in $isSelected).toBe(false)
        expect($isSelected(1)).toBe(true)
        expect($isSelected(2)).toBe(false)
        expect(isMounted(source)).toBe(false)
        expect(mounted).not.toHaveBeenCalled()

        stopMounted()
      })

      it('should attach on the first tracked key and detach on the last reader', () => {
        const source = mountable(signal(1))
        const mounted: boolean[] = []
        const stopMounted = onMounted(source, value => mounted.push(value))
        const $isSelected = selector(source)
        const stopOne = effect(() => {
          $isSelected(1)
        })
        const stopTwo = effect(() => {
          $isSelected(2)
        })

        expect(mounted).toEqual([true])

        stopOne()
        expect(mounted).toEqual([true])

        stopTwo()
        expect(mounted).toEqual([true, false])

        stopMounted()
      })

      it('should keep exactly one source link for any number of keys', () => {
        const source = signal(0)
        const $isSelected = selector(source)
        const stops = Array.from(
          {
            length: 1000
          },
          (_, key) => effect(() => {
            $isSelected(key)
          })
        )

        expect(source.node.subs).toBe(source.node.subsTail)
        expect(source.node.subs?.nextSub).toBeUndefined()

        stops.forEach(stop => stop())

        expect(source.node.subs).toBeUndefined()
      })

      it('should only notify keys whose values changed', () => {
        const source = signal(1)
        const $isSelected = selector(source)
        const one = vi.fn()
        const two = vi.fn()
        const three = vi.fn()
        const stops = [
          effect(() => one($isSelected(1))),
          effect(() => two($isSelected(2))),
          effect(() => three($isSelected(3)))
        ]

        source(2)

        expect(one).toHaveBeenCalledTimes(2)
        expect(two).toHaveBeenCalledTimes(2)
        expect(three).toHaveBeenCalledTimes(1)

        stops.forEach(stop => stop())
      })

      it('should derive custom values and gate unchanged results', () => {
        const source = signal(1)
        const $isSelected = selector(source, (key: number, value) => Math.abs(key - value))
        const zero = vi.fn()
        const two = vi.fn()
        const stopZero = effect(() => zero($isSelected(0)))
        const stopTwo = effect(() => two($isSelected(2)))

        source(3)

        expect(zero).toHaveBeenLastCalledWith(3)
        expect(zero).toHaveBeenCalledTimes(2)
        expect(two).toHaveBeenLastCalledWith(1)
        expect(two).toHaveBeenCalledTimes(1)

        stopZero()
        stopTwo()
      })

      it('should propagate through a computed caller', () => {
        const source = signal(1)
        const $isSelected = selector(source)
        const selectedOne = computed(() => $isSelected(1))
        const values: boolean[] = []
        const stop = effect(() => {
          values.push(selectedOne())
        })

        source(2)
        source(3)
        source(1)

        expect(values).toEqual([true, false, true])

        stop()
      })

      it('should support two callers of the same key', () => {
        const source = signal(1)
        const $isSelected = selector(source)
        const first = vi.fn()
        const second = vi.fn()
        const stopFirst = effect(() => first($isSelected(1)))
        const stopSecond = effect(() => second($isSelected(1)))

        stopFirst()
        source(2)

        expect(first).toHaveBeenCalledTimes(1)
        expect(second).toHaveBeenCalledTimes(2)

        stopSecond()
      })

      it('should release churned keys and recreate a $isSelected key correctly', () => {
        const source = mountable(signal(2))
        const states: boolean[] = []
        const $isSelected = selector(source)
        const stop = watchKeys($isSelected, [1, 2, 3], states)

        expect(states).toEqual([false, true, false])

        stop()
        expect(isMounted(source)).toBe(false)

        const recreated: boolean[] = []
        const stopRecreated = watchKeys($isSelected, [2, 4], recreated)

        expect(recreated).toEqual([true, false])

        stopRecreated()
      })

      it('should not retain destroyed keys across list replacement', () => {
        const source = signal(0)
        const derive = vi.fn((key: number, value: number) => key === value)
        const $isSelected = selector(source, derive)
        const first = Array.from(
          {
            length: 20
          },
          (_, key) => key
        )
        const second = Array.from(
          {
            length: 20
          },
          (_, key) => key + 20
        )
        const stopFirst = watchKeys($isSelected, first, [])

        stopFirst()

        const stopSecond = watchKeys($isSelected, second, [])

        derive.mockClear()
        source(1)

        expect(derive).toHaveBeenCalledTimes(20)

        stopSecond()
      })

      it('should move a caller between keys and release the old key', () => {
        const source = signal(1)
        const key = signal(1)
        const $isSelected = selector(source)
        const values: boolean[] = []
        const stop = effect(() => {
          values.push($isSelected(key()))
        })

        key(2)
        source(2)
        source(1)

        expect(values).toEqual([true, false, true, false])

        stop()
      })

      it('should answer a $isSelected key first requested inside a batch', () => {
        const source = signal(1)
        const $isSelected = selector(source)
        const first: boolean[] = []
        const stopFirst = effect(() => {
          first.push($isSelected(1))
        })
        const second: boolean[] = []
        let stopSecond: (() => void) | undefined

        batch(() => {
          source(2)
          stopSecond = effect(() => {
            second.push($isSelected(2))
          })

          // asked between the write and its flush: the answer is the one the
          // source already has, and it is answered once
          expect(second).toEqual([true])
        })

        expect(first).toEqual([true, false])
        expect(second).toEqual([true])

        stopFirst()
        stopSecond!()
      })

      it('should not notify keys when the source settles on the same value', () => {
        const source = signal(1)
        const $isSelected = selector(source)
        const seen: boolean[] = []
        const stop = effect(() => {
          seen.push($isSelected(1))
        })

        trigger(() => source())

        expect(seen).toEqual([true])

        stop()
      })

      it('should not mount the source from a reader a mount listener created', () => {
        const source = mountable(signal(1))
        const $isSelected = selector(source)
        let inside: (() => void) | undefined

        // the exemption is per subscriber and names the node that subscriber
        // reads: a reader of a key is not exempt from the source behind it,
        // exactly as a reader of a computed is not. So it does keep the
        // source mounted - and a selector says the same thing a computed
        // over the same signal says
        onMounted(source, (mounted) => {
          if (mounted) {
            inside = effect(() => {
              $isSelected(1)
            })
          }
        })

        const stop = effect(() => {
          $isSelected(2)
        })

        expect(isMounted(source)).toBe(true)

        stop()

        expect(isMounted(source)).toBe(true)

        inside?.()

        expect(isMounted(source)).toBe(false)
      })

      it('should survive a derivation that drops the last reader of its key', () => {
        const source = signal(1)
        const seen: boolean[] = []
        // oxlint-disable-next-line prefer-const
        let stopOwn: (() => void) | undefined
        // user code runs before the key is notified, and it is allowed to
        // take the very reader the notification was meant for
        const $isSelected = selector(source, (key: number, value) => {
          if (key === 1 && value === 9) {
            stopOwn!()
          }

          return key === value
        })

        stopOwn = effect(() => {
          $isSelected(1)
        })

        const stop = effect(() => {
          seen.push($isSelected(2))
        })

        source(9)

        expect(seen).toEqual([false])

        source(2)

        expect(seen).toEqual([false, true])

        stop()
      })

      it('should not attach for a read in a scope body', () => {
        const source = mountable(signal(1))
        const $isSelected = selector(source)
        // a scope never re-runs, so a subscription taken for it could only
        // be paid for and never used - and it must not mount the source,
        // just as a plain signal read from the same place does not
        const stopScope = effectScope(() => {
          expect($isSelected(1)).toBe(true)
          expect($isSelected(2)).toBe(false)
        })

        expect(isMounted(source)).toBe(false)
        expect(source.node.subs).toBeUndefined()

        stopScope()
      })

      it('should reject key and result types the runtime cannot honour', () => {
        const $num = signal(1)

        // @ts-expect-error a result type without a derivation: the runtime answers booleans
        selector<number, number, string>($num)
        // @ts-expect-error a key type unrelated to the source: nothing can ever match
        selector<number, string>($num)

        const $isSelected = selector($num)
        const $derived = selector($num, (key: number, value) => `${key}:${value}`)

        expectTypeOf($isSelected).toEqualTypeOf<(key: number) => boolean>()
        expectTypeOf($derived).toEqualTypeOf<(key: number) => string>()
        expect($isSelected(1)).toBe(true)
      })

      it('should infer the key from the source in a derivation', () => {
        const $num = signal(1)
        const $isSelected = selector($num, (key, value) => key === value)

        expectTypeOf($isSelected).toEqualTypeOf<(key: number) => boolean>()
        expect($isSelected(1)).toBe(true)
      })

      it('should allow a key narrower than the source', () => {
        const $selected = signal<number | undefined>(undefined)
        const $isSelected = selector<number | undefined, number>($selected)

        expect($isSelected(1)).toBe(false)
      })

      it('should allow a caller to ask for a key while the selector is updating', () => {
        const source = signal(1)
        let stopNested: (() => void) | undefined
        let nested: boolean | undefined
        const $isSelected = selector(source, (key: number, value) => {
          if (key === 1 && value === 2 && stopNested === undefined) {
            stopNested = effect(() => {
              nested = $isSelected(2)
            })
          }

          return key === value
        })
        const outer: boolean[] = []
        const stopOuter = effect(() => {
          outer.push($isSelected(1))
        })

        source(2)

        expect(outer).toEqual([true, false])
        expect(nested).toBe(true)

        stopOuter()
        stopNested!()
      })

      it('should work in nested effects without attaching the tracker to the caller', () => {
        const source = mountable(signal(1))
        const outer = signal(true)
        const $isSelected = selector(source)
        let stopInner: (() => void) | undefined
        const stopOuter = effect(() => {
          outer()
          stopInner?.()
          stopInner = effect(() => {
            $isSelected(1)
          })
        })

        outer(false)
        expect(isMounted(source)).toBe(true)

        stopOuter()
        expect(isMounted(source)).toBe(false)

        stopInner!()
        expect(isMounted(source)).toBe(false)
      })

      it('should attach and detach with a deferred scope only while it is started', () => {
        const source = mountable(signal(1))
        const $isSelected = selector(source)
        const values: boolean[] = []
        const scope = deferScope(() => {
          effect(() => {
            values.push($isSelected(1))
          })
        })

        expect(values).toEqual([])
        expect(isMounted(source)).toBe(false)

        startScope(scope)
        expect(values).toEqual([true])
        expect(isMounted(source)).toBe(true)

        stopScope(scope)
        expect(isMounted(source)).toBe(false)
      })

      it('should not attach for a direct read in a deferred scope body', () => {
        const source = mountable(signal(1))
        const $isSelected = selector(source)
        const scope = deferScope(() => {
          $isSelected(1)
        })

        expect(isMounted(source)).toBe(false)
        expect(source.node.subs).toBeUndefined()

        startScope(scope)
        expect(isMounted(source)).toBe(false)

        stopScope(scope)
      })

      it('should not track custom derivation reads in a caller', () => {
        const source = signal(1)
        const other = signal('a')
        const $isSelected = selector(source, (key: number, value) => `${key === value}:${other()}`)
        const values: string[] = []
        const stop = effect(() => {
          values.push($isSelected(1))
        })

        other('b')
        expect(values).toEqual(['true:a'])

        source(2)
        expect(values).toEqual(['true:a', 'false:b'])

        stop()
      })

      it('should answer untracked from the current source during a batch', () => {
        const source = signal(1)
        const $isSelected = selector(source)
        const stop = effect(() => {
          $isSelected(1)
        })

        batch(() => {
          source(2)
          expect(untracked(() => $isSelected(2))).toBe(true)
        })

        stop()
      })
    })

    describe('createSignal', () => {
      it('should create a second face over the same node', () => {
        const $num = signal(1)
        const node = $num.node as SignalNode<number> & {
          get(): number
          set(value: number): void
        }

        node.get = () => $num() * 2
        node.set = value => $num(value / 2)

        const $double = createSignal(function doubleOper(this: typeof node, ...value: [number]) {
          if (value.length) {
            this.set(value[0])
          } else {
            return this.get()
          }
        }, node)

        expect(isSignal($double)).toBe(true)
        expect($double.node).toBe($num.node)
        expect($double()).toBe(2)

        $double(10)

        expect($num()).toBe(5)
      })
    })

    /**
     * Tests adopted with thanks from preact-signals implementation at
     * https://github.com/preactjs/signals/blob/main/packages/core/test/signal.test.tsx
     *
     * The MIT License (MIT)
     *
     * Copyright (c) 2022-present Preact Team
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE
     */

    describe('topology', () => {
      describe('graph updates', () => {
        it('should drop A->B->A updates', () => {
          //     A
          //   / |
          //  B  | <- Looks like a flag doesn't it? :D
          //   \ |
          //     C
          //     |
          //     D
          const a = signal(2)
          const b = computed(() => a() - 1)
          const c = computed(() => a() + b())
          const compute = vi.fn(() => `d: ${c()}`)
          const d = computed(compute)

          // Trigger read
          expect(d()).toBe('d: 3')
          expect(compute).toHaveBeenCalledOnce()
          compute.mockClear()

          a(4)
          d()
          expect(compute).toHaveBeenCalledOnce()
        })

        it('should only update every signal once (diamond graph)', () => {
          // In this scenario "D" should only update once when "A" receives
          // an update. This is sometimes referred to as the "diamond" scenario.
          //     A
          //   /   \
          //  B     C
          //   \   /
          //     D

          const a = signal('a')
          const b = computed(() => a())
          const c = computed(() => a())
          const spy = vi.fn(() => `${b()} ${c()}`)
          const d = computed(spy)

          expect(d()).toBe('a a')
          expect(spy).toHaveBeenCalledOnce()

          a('aa')
          expect(d()).toBe('aa aa')
          expect(spy).toHaveBeenCalledTimes(2)
        })

        it('should only update every signal once (diamond graph + tail)', () => {
          // "E" will be likely updated twice if our mark+sweep logic is buggy.
          //     A
          //   /   \
          //  B     C
          //   \   /
          //     D
          //     |
          //     E

          const a = signal('a')
          const b = computed(() => a())
          const c = computed(() => a())
          const d = computed(() => `${b()} ${c()}`)
          const spy = vi.fn(() => d())
          const e = computed(spy)

          expect(e()).toBe('a a')
          expect(spy).toHaveBeenCalledOnce()

          a('aa')
          expect(e()).toBe('aa aa')
          expect(spy).toHaveBeenCalledTimes(2)
        })

        it('should bail out if result is the same', () => {
          // Bail out if value of "B" never changes
          // A->B->C
          const a = signal('a')
          const b = computed(() => {
            a()
            return 'foo'
          })
          const spy = vi.fn(() => b())
          const c = computed(spy)

          expect(c()).toBe('foo')
          expect(spy).toHaveBeenCalledOnce()

          a('aa')
          expect(c()).toBe('foo')
          expect(spy).toHaveBeenCalledOnce()
        })

        it('should only update every signal once (jagged diamond graph + tails)', () => {
          // "F" and "G" will be likely updated twice if our mark+sweep logic is buggy.
          //     A
          //   /   \
          //  B     C
          //  |     |
          //  |     D
          //   \   /
          //     E
          //   /   \
          //  F     G
          const a = signal('a')
          const b = computed(() => a())
          const c = computed(() => a())
          const d = computed(() => c())
          const eSpy = vi.fn(() => `${b()} ${d()}`)
          const e = computed(eSpy)
          const fSpy = vi.fn(() => e())
          const f = computed(fSpy)
          const gSpy = vi.fn(() => e())
          const g = computed(gSpy)

          expect(f()).toBe('a a')
          expect(fSpy).toHaveBeenCalledTimes(1)

          expect(g()).toBe('a a')
          expect(gSpy).toHaveBeenCalledTimes(1)

          eSpy.mockClear()
          fSpy.mockClear()
          gSpy.mockClear()

          a('b')

          expect(e()).toBe('b b')
          expect(eSpy).toHaveBeenCalledTimes(1)

          expect(f()).toBe('b b')
          expect(fSpy).toHaveBeenCalledTimes(1)

          expect(g()).toBe('b b')
          expect(gSpy).toHaveBeenCalledTimes(1)

          eSpy.mockClear()
          fSpy.mockClear()
          gSpy.mockClear()

          a('c')

          expect(e()).toBe('c c')
          expect(eSpy).toHaveBeenCalledTimes(1)

          expect(f()).toBe('c c')
          expect(fSpy).toHaveBeenCalledTimes(1)

          expect(g()).toBe('c c')
          expect(gSpy).toHaveBeenCalledTimes(1)

          // top to bottom
          // expect(eSpy).toHaveBeenCalledBefore(fSpy)
          // // left to right
          // expect(fSpy).toHaveBeenCalledBefore(gSpy)
        })

        it('should only subscribe to signals listened to', () => {
          //    *A
          //   /   \
          // *B     C <- we don't listen to C
          const a = signal('a')
          const b = computed(() => a())
          const spy = vi.fn(() => a())

          computed(spy)

          expect(b()).toBe('a')
          expect(spy).not.toHaveBeenCalled()

          a('aa')
          expect(b()).toBe('aa')
          expect(spy).not.toHaveBeenCalled()
        })

        it('should only subscribe to signals listened to II', () => {
          // Here both "B" and "C" are active in the beginning, but
          // "B" becomes inactive later. At that point it should
          // not receive any updates anymore.
          //    *A
          //   /   \
          // *B     D <- we don't listen to C
          //  |
          // *C
          const a = signal('a')
          const spyB = vi.fn(() => a())
          const b = computed(spyB)
          const spyC = vi.fn(() => b())
          const c = computed(spyC)
          const d = computed(() => a())
          let result = ''
          const unsub = effect(() => {
            result = c()
          })

          expect(result).toBe('a')
          expect(d()).toBe('a')

          spyB.mockClear()
          spyC.mockClear()
          unsub()

          a('aa')

          expect(spyB).not.toHaveBeenCalled()
          expect(spyC).not.toHaveBeenCalled()
          expect(d()).toBe('aa')
        })

        it('should ensure subs update even if one dep unmarks it', () => {
          // In this scenario "C" always returns the same value. When "A"
          // changes, "B" will update, then "C" at which point its update
          // to "D" will be unmarked. But "D" must still update because
          // "B" marked it. If "D" isn't updated, then we have a bug.
          //     A
          //   /   \
          //  B     *C <- returns same value every time
          //   \   /
          //     D
          const a = signal('a')
          const b = computed(() => a())
          const c = computed(() => {
            a()
            return 'c'
          })
          const spy = vi.fn(() => `${b()} ${c()}`)
          const d = computed(spy)

          expect(d()).toBe('a c')
          spy.mockClear()

          a('aa')
          d()
          expect(spy).toHaveReturnedWith('aa c')
        })

        it('should ensure subs update even if two deps unmark it', () => {
          // In this scenario both "C" and "D" always return the same
          // value. But "E" must still update because "A" marked it.
          // If "E" isn't updated, then we have a bug.
          //     A
          //   / | \
          //  B *C *D
          //   \ | /
          //     E
          const a = signal('a')
          const b = computed(() => a())
          const c = computed(() => {
            a()
            return 'c'
          })
          const d = computed(() => {
            a()
            return 'd'
          })
          const spy = vi.fn(() => `${b()} ${c()} ${d()}`)
          const e = computed(spy)

          expect(e()).toBe('a c d')
          spy.mockClear()

          a('aa')
          e()
          expect(spy).toHaveReturnedWith('aa c d')
        })

        it('should support lazy branches', () => {
          const a = signal(0)
          const b = computed(() => a())
          const c = computed(() => (a() > 0 ? a() : b()))

          expect(c()).toBe(0)
          a(1)
          expect(c()).toBe(1)

          a(0)
          expect(c()).toBe(0)
        })

        it('should not update a sub if all deps unmark it', () => {
          // In this scenario "B" and "C" always return the same value. When "A"
          // changes, "D" should not update.
          //     A
          //   /   \
          // *B     *C
          //   \   /
          //     D
          const a = signal('a')
          const b = computed(() => {
            a()
            return 'b'
          })
          const c = computed(() => {
            a()
            return 'c'
          })
          const spy = vi.fn(() => `${b()} ${c()}`)
          const d = computed(spy)

          expect(d()).toBe('b c')
          spy.mockClear()

          a('aa')
          expect(spy).not.toHaveBeenCalled()
        })
      })

      describe('error handling', () => {
        it('should keep graph consistent on errors during activation', () => {
          const a = signal(0)
          const b = computed(() => {
            throw new Error('fail')
          })
          const c = computed(() => a())

          expect(() => b()).toThrow('fail')

          a(1)
          expect(c()).toBe(1)
        })

        it('should keep graph consistent on errors in computeds', () => {
          const a = signal(0)
          const b = computed(() => {
            if (a() === 1) {
              throw new Error('fail')
            }

            return a()
          })
          const c = computed(() => b())

          expect(c()).toBe(0)

          a(1)
          expect(() => b()).toThrow('fail')

          a(2)
          expect(c()).toBe(2)
        })
      })
    })

    describe('trigger', () => {
      it('should trigger updates for dependent computed signals', () => {
        const arr = signal<number[]>([])
        const length = computed(() => arr().length)

        expect(length()).toBe(0)
        arr().push(1)
        trigger(arr)
        expect(length()).toBe(1)
        trigger(() => arr().push(2))
        expect(length()).toBe(2)
      })

      it('should trigger updates for the second source signal', () => {
        const src1 = signal<number[]>([])
        const src2 = signal<number[]>([])
        const length = computed(() => src2().length)

        expect(length()).toBe(0)
        src2().push(1)
        trigger(() => {
          src1()
          src2()
        })
        expect(length()).toBe(1)
      })

      it('should trigger effect once', () => {
        const src1 = signal<number[]>([])
        const src2 = signal<number[]>([])
        let triggers = 0

        effect(() => {
          triggers++
          src1()
          src2()
        })

        expect(triggers).toBe(1)
        trigger(() => {
          src1()
          src2()
        })
        expect(triggers).toBe(2)
      })

      it('should not notify the trigger function sub', () => {
        const src1 = signal<number[]>([])
        const src2 = computed(() => src1())
        let triggers = 0

        effect(() => {
          triggers++
          src1()
          src2()
        })

        expect(triggers).toBe(1)
        trigger(() => {
          src1()
          src2()
        })
        expect(triggers).toBe(2)
      })

      it('should allow writing a signal after reading it', () => {
        const src1 = signal(1)

        trigger(() => {
          src1()
          src1(src1() + 1)
        })

        expect(src1()).toBe(2)
      })

      it('should rerun effect once when writing a signal after reading it', () => {
        const src1 = signal(1)
        let triggers = 0

        effect(() => {
          triggers++
          src1()
        })

        expect(triggers).toBe(1)

        trigger(() => {
          src1()
          src1(src1() + 1)
        })

        expect(triggers).toBe(2)
        expect(src1()).toBe(2)
      })
    })
  })
})
