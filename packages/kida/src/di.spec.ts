import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import {
  deferScope,
  effect
} from 'agera'
import {
  Injectable,
  Injector,
  getInjector,
  run,
  inject
} from './di.js'

describe('kida', () => {
  describe('di', () => {
    describe('getInjector', () => {
      it('should return current injector', () => {
        const injector = new Injector()
        const fn = vi.fn(() => {
          expect(getInjector()).toBe(injector)
        })

        expect(getInjector()).toBeUndefined()

        run(injector, fn)

        expect(fn).toHaveBeenCalledTimes(1)
        expect(getInjector()).toBeUndefined()
      })
    })

    describe('run', () => {
      it('should run undefined injector', () => {
        const fn = vi.fn(() => {
          expect(getInjector()).toBeUndefined()
        })

        run(undefined, fn)

        expect(fn).toHaveBeenCalledTimes(1)
      })

      it('should run injector', () => {
        const injector = new Injector()
        const fn = vi.fn(() => {
          expect(getInjector()).toBe(injector)
        })

        run(injector, fn)

        expect(fn).toHaveBeenCalledTimes(1)
      })

      it('should run nested injectors', () => {
        const parent = new Injector()
        const child = new Injector(undefined, parent)
        const fn = vi.fn(() => {
          expect(getInjector()).toBe(child)
        })

        run(parent, () => {
          expect(getInjector()).toBe(parent)

          run(child, fn)

          expect(getInjector()).toBe(parent)
        })

        expect(fn).toHaveBeenCalledTimes(1)
      })

      it('should restore injector after error', () => {
        const injector = new Injector()

        expect(() => run(injector, () => {
          throw new Error()
        })).toThrow()

        expect(getInjector()).toBeUndefined()
      })
    })

    describe('Injector + inject', () => {
      it('should inject dependency', () => {
        const injector = new Injector()
        const token = vi.fn(() => 42)

        run(injector, () => {
          const value = inject(token)

          expect(value).toBe(42)

          inject(token)
        })

        expect(token).toHaveBeenCalledTimes(1)
      })

      it('should inject class dependency', () => {
        const constructorA = vi.fn()
        const constructorB = vi.fn()
        const injector = new Injector()

        class ServiceA$ extends Injectable {
          value = 42

          constructor() {
            super()
            constructorA()
          }
        }

        class ServiceB$ extends Injectable {
          a = inject(ServiceA$)

          constructor() {
            super()
            constructorB()
          }
        }

        run(injector, () => {
          const value = inject(ServiceB$)

          expect(value).toBeInstanceOf(ServiceB$)
          expect(value.a).toBeInstanceOf(ServiceA$)
          expect(value.a.value).toBe(42)
          expect(inject(ServiceA$)).toBe(value.a)
          expect(inject(ServiceB$)).toBe(value)
        })

        expect(constructorA).toHaveBeenCalledTimes(1)
        expect(constructorB).toHaveBeenCalledTimes(1)
        expect(injector.has(ServiceA$)).toBe(true)
        expect(injector.has(ServiceB$)).toBe(true)
      })

      it('should inject provided dependency', () => {
        const token = vi.fn(() => 42)
        const injector = new Injector([[token, 404]])
        const app = vi.fn(() => {
          const value = inject(token)

          expect(value).toBe(404)

          inject(token)
        })

        run(injector, app)

        expect(app).toHaveBeenCalledTimes(1)
        expect(token).toHaveBeenCalledTimes(0)
      })

      it('should define dependency only in nearest injector', () => {
        const token = vi.fn(() => 42)
        const root = new Injector()
        const child = new Injector(undefined, root)
        const childApp = vi.fn(() => {
          const value = inject(token)

          expect(value).toBe(42)

          inject(token)
        })
        const app = vi.fn(() => {
          run(child, childApp)
        })

        run(root, app)

        expect(app).toHaveBeenCalledTimes(1)
        expect(childApp).toHaveBeenCalledTimes(1)
        expect(token).toHaveBeenCalledTimes(1)
        expect(root.has(token)).toBe(false)
        expect(child.has(token)).toBe(true)
      })

      it('should get dependency from root injector', () => {
        const token = vi.fn(() => 42)
        const root = new Injector()
        const child = new Injector(undefined, root)
        const childApp = vi.fn(() => {
          const value = inject(token)

          expect(value).toBe(42)
        })
        const app = vi.fn(() => {
          const value = inject(token)

          expect(value).toBe(42)

          run(child, childApp)
        })

        run(root, app)

        expect(app).toHaveBeenCalledTimes(1)
        expect(childApp).toHaveBeenCalledTimes(1)
        expect(token).toHaveBeenCalledTimes(1)
        expect(root.has(token)).toBe(true)
        expect(child.has(token)).toBe(true)
      })

      it('should inject into given injector from argument', () => {
        const token = vi.fn(() => 42)
        const injector = new Injector()

        expect(inject(token, injector)).toBe(42)
        expect(inject(token, injector)).toBe(42)

        expect(token).toHaveBeenCalledTimes(1)
        expect(injector.has(token)).toBe(true)
      })

      it('should support nested injection while using injector from argument', () => {
        const A = vi.fn(() => 1)
        const B = vi.fn(() => inject(A) + 1)
        const injector = new Injector()

        expect(inject(B, injector)).toBe(2)
        expect(inject(B, injector)).toBe(2)

        expect(A).toHaveBeenCalledTimes(1)
        expect(B).toHaveBeenCalledTimes(1)
        expect(injector.has(A)).toBe(true)
        expect(injector.has(B)).toBe(true)
      })

      it('should use child injector when injecting transitive dependency from child injector', () => {
        const x = {}
        const y = {}
        const A$ = vi.fn(() => x)
        const B$ = vi.fn(() => inject(A$))
        const outer = new Injector([[A$, x]])
        const inner = new Injector([[A$, y]], outer)
        const value = inject(B$, inner)

        expect(value).toBe(y)
        expect(B$).toHaveBeenCalledTimes(1)
        expect(inner.has(B$)).toBe(true)
        expect(inner.get(B$)).toBe(y)
      })

      it('should ignore defer scope', () => {
        const injector = new Injector()
        const destroy = vi.fn()
        const fn = vi.fn(() => destroy)
        const Token$ = vi.fn(() => {
          effect(fn)

          return 42
        })
        let value
        const start = deferScope(() => {
          value = inject(Token$, injector)
          value = inject(Token$, injector)
        })

        expect(value).toBe(42)
        expect(Token$).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(destroy).not.toHaveBeenCalled()

        const stop = start()

        expect(Token$).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(destroy).not.toHaveBeenCalled()

        stop()

        expect(Token$).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(destroy).not.toHaveBeenCalled()
      })
    })
  })
})
