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
  InjectionContext,
  getContext,
  run,
  inject
} from './di.js'

describe('kida', () => {
  describe('di', () => {
    describe('getContext', () => {
      it('should return current context', () => {
        const context = new InjectionContext()
        const fn = vi.fn(() => {
          expect(getContext()).toBe(context)
        })

        expect(getContext()).toBeUndefined()

        run(context, fn)

        expect(fn).toHaveBeenCalledTimes(1)
        expect(getContext()).toBeUndefined()
      })
    })

    describe('run', () => {
      it('should run undefined context', () => {
        const fn = vi.fn(() => {
          expect(getContext()).toBeUndefined()
        })

        run(undefined, fn)

        expect(fn).toHaveBeenCalledTimes(1)
      })

      it('should run context', () => {
        const context = new InjectionContext()
        const fn = vi.fn(() => {
          expect(getContext()).toBe(context)
        })

        run(context, fn)

        expect(fn).toHaveBeenCalledTimes(1)
      })

      it('should run nested contexts', () => {
        const parent = new InjectionContext()
        const child = new InjectionContext(undefined, parent)
        const fn = vi.fn(() => {
          expect(getContext()).toBe(child)
        })

        run(parent, () => {
          expect(getContext()).toBe(parent)

          run(child, fn)

          expect(getContext()).toBe(parent)
        })

        expect(fn).toHaveBeenCalledTimes(1)
      })

      it('should restore context after error', () => {
        const context = new InjectionContext()

        expect(() => run(context, () => {
          throw new Error()
        })).toThrow()

        expect(getContext()).toBeUndefined()
      })
    })

    describe('InjectionContext + inject', () => {
      it('should inject dependency', () => {
        const context = new InjectionContext()
        const factory = vi.fn(() => 42)

        run(context, () => {
          const value = inject(factory)

          expect(value).toBe(42)

          inject(factory)
        })

        expect(factory).toHaveBeenCalledTimes(1)
      })

      it('should inject provided dependency', () => {
        const factory = vi.fn(() => 42)
        const context = new InjectionContext([[factory, 404]])
        const app = vi.fn(() => {
          const value = inject(factory)

          expect(value).toBe(404)

          inject(factory)
        })

        run(context, app)

        expect(app).toHaveBeenCalledTimes(1)
        expect(factory).toHaveBeenCalledTimes(0)
      })

      it('should define dependency only in nearest context', () => {
        const factory = vi.fn(() => 42)
        const root = new InjectionContext()
        const child = new InjectionContext(undefined, root)
        const childApp = vi.fn(() => {
          const value = inject(factory)

          expect(value).toBe(42)

          inject(factory)
        })
        const app = vi.fn(() => {
          run(child, childApp)
        })

        run(root, app)

        expect(app).toHaveBeenCalledTimes(1)
        expect(childApp).toHaveBeenCalledTimes(1)
        expect(factory).toHaveBeenCalledTimes(1)
        expect(root.has(factory)).toBe(false)
        expect(child.has(factory)).toBe(true)
      })

      it('should get dependency from root context', () => {
        const factory = vi.fn(() => 42)
        const root = new InjectionContext()
        const child = new InjectionContext(undefined, root)
        const childApp = vi.fn(() => {
          const value = inject(factory)

          expect(value).toBe(42)
        })
        const app = vi.fn(() => {
          const value = inject(factory)

          expect(value).toBe(42)

          run(child, childApp)
        })

        run(root, app)

        expect(app).toHaveBeenCalledTimes(1)
        expect(childApp).toHaveBeenCalledTimes(1)
        expect(factory).toHaveBeenCalledTimes(1)
        expect(root.has(factory)).toBe(true)
        expect(child.has(factory)).toBe(true)
      })

      it('should inject into given context from argument', () => {
        const factory = vi.fn(() => 42)
        const context = new InjectionContext()

        expect(inject(factory, context)).toBe(42)
        expect(inject(factory, context)).toBe(42)

        expect(factory).toHaveBeenCalledTimes(1)
        expect(context.has(factory)).toBe(true)
      })

      it('should support nested injection while using context from argument', () => {
        const A = vi.fn(() => 1)
        const B = vi.fn(() => inject(A) + 1)
        const context = new InjectionContext()

        expect(inject(B, context)).toBe(2)
        expect(inject(B, context)).toBe(2)

        expect(A).toHaveBeenCalledTimes(1)
        expect(B).toHaveBeenCalledTimes(1)
        expect(context.has(A)).toBe(true)
        expect(context.has(B)).toBe(true)
      })

      it('should use child context when injecting transitive dependency from child context', () => {
        const x = {}
        const y = {}
        const A$ = vi.fn(() => x)
        const B$ = vi.fn(() => inject(A$))
        const outer = new InjectionContext([[A$, x]])
        const inner = new InjectionContext([[A$, y]], outer)
        const value = inject(B$, inner)

        expect(value).toBe(y)
        expect(B$).toHaveBeenCalledTimes(1)
        expect(inner.has(B$)).toBe(true)
        expect(inner.get(B$)).toBe(y)
      })

      it('should ignore defer scope', () => {
        const context = new InjectionContext()
        const destroy = vi.fn()
        const fn = vi.fn(() => destroy)
        const Factory$ = vi.fn(() => {
          effect(fn)

          return 42
        })
        let value
        const start = deferScope(() => {
          value = inject(Factory$, context)
          value = inject(Factory$, context)
        })

        expect(value).toBe(42)
        expect(Factory$).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(destroy).not.toHaveBeenCalled()

        const stop = start()

        expect(Factory$).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(destroy).not.toHaveBeenCalled()

        stop()

        expect(Factory$).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(destroy).not.toHaveBeenCalled()
      })
    })
  })
})
