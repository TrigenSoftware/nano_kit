import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import {
  deferScope,
  startScope,
  stopScope,
  effect
} from 'agera'
import {
  Injectable$,
  InjectionContext,
  getContext,
  run,
  provide,
  inject,
  provideAs
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

      it('should inject class dependency', () => {
        const constructorA = vi.fn()
        const constructorB = vi.fn()
        const context = new InjectionContext()

        class ServiceA$ extends Injectable$ {
          value = 42

          constructor() {
            super()
            constructorA()
          }
        }

        class ServiceB$ extends Injectable$ {
          a = inject(ServiceA$)

          constructor() {
            super()
            constructorB()
          }
        }

        run(context, () => {
          const value = inject(ServiceB$)

          expect(value).toBeInstanceOf(ServiceB$)
          expect(value.a).toBeInstanceOf(ServiceA$)
          expect(value.a.value).toBe(42)
          expect(inject(ServiceA$)).toBe(value.a)
          expect(inject(ServiceB$)).toBe(value)
        })

        expect(constructorA).toHaveBeenCalledTimes(1)
        expect(constructorB).toHaveBeenCalledTimes(1)
        expect(context.deps.has(ServiceA$)).toBe(true)
        expect(context.deps.has(ServiceB$)).toBe(true)
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

      it('should define dependency in the top context', () => {
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
        expect(root.deps.has(factory)).toBe(true)
        expect(inject(factory, root)).toBe(42)
        expect(factory).toHaveBeenCalledTimes(1)
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
        expect(root.deps.has(factory)).toBe(true)
        expect(child.deps.has(factory)).toBe(true)
      })

      it('should inject into given context from argument', () => {
        const factory = vi.fn(() => 42)
        const context = new InjectionContext()

        expect(inject(factory, context)).toBe(42)
        expect(inject(factory, context)).toBe(42)

        expect(factory).toHaveBeenCalledTimes(1)
        expect(context.deps.has(factory)).toBe(true)
      })

      it('should support nested injection while using context from argument', () => {
        const A = vi.fn(() => 1)
        const B = vi.fn(() => inject(A) + 1)
        const context = new InjectionContext()

        expect(inject(B, context)).toBe(2)
        expect(inject(B, context)).toBe(2)

        expect(A).toHaveBeenCalledTimes(1)
        expect(B).toHaveBeenCalledTimes(1)
        expect(context.deps.has(A)).toBe(true)
        expect(context.deps.has(B)).toBe(true)
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
        expect(inner.deps.has(B$)).toBe(true)
        // The requesting context keeps a copy anyway: only the parent tells where the dependency is owned
        expect(outer.deps.has(B$)).toBe(false)
        expect(inner.get(B$)).toBe(y)
      })

      it('should use child context when the transitive dependency was injected from parent context first', () => {
        const x = {}
        const y = {}
        const A$ = vi.fn(() => x)
        const B$ = vi.fn(() => inject(A$))
        const outer = new InjectionContext([[A$, x]])
        const inner = new InjectionContext([[A$, y]], outer)

        expect(inject(B$, outer)).toBe(x)
        expect(inject(B$, inner)).toBe(y)
        expect(inject(B$, outer)).toBe(x)
        expect(B$).toHaveBeenCalledTimes(2)
      })

      it('should keep dependency above the context that only provides values', () => {
        const Value$ = vi.fn(() => 'default')
        const Store$ = vi.fn(() => ({}))
        const root = new InjectionContext()
        const first = inject(Store$, new InjectionContext([provide(Value$, 'a')], root))
        const second = inject(Store$, new InjectionContext([provide(Value$, 'b')], root))

        expect(first).toBe(second)
        expect(inject(Store$, root)).toBe(first)
        expect(Store$).toHaveBeenCalledTimes(1)
        expect(root.deps.has(Store$)).toBe(true)
      })

      it('should keep dependency in the context that provides what it injects', () => {
        const Theme$ = vi.fn(() => 'light')
        const Outlet$ = vi.fn((): unknown => null)
        const Store$ = vi.fn(() => ({
          theme: inject(Theme$)
        }))
        const root = new InjectionContext()
        const themed = new InjectionContext([provide(Theme$, 'dark')], root)
        const first = inject(Store$, new InjectionContext([provide(Outlet$, 1)], themed))
        const second = inject(Store$, new InjectionContext([provide(Outlet$, 2)], themed))

        expect(first).toBe(second)
        expect(first.theme).toBe('dark')
        expect(themed.deps.has(Store$)).toBe(true)
        expect(root.deps.has(Store$)).toBe(false)
        expect(inject(Store$, root).theme).toBe('light')
        expect(Store$).toHaveBeenCalledTimes(2)
      })

      it('should create anew only the dependencies that inject the overridden one', () => {
        const Locale$ = vi.fn(() => 'en')
        const Api$ = vi.fn(() => ({
          locale: inject(Locale$)
        }))
        const Store$ = vi.fn(() => ({
          api: inject(Api$)
        }))
        const Other$ = vi.fn(() => ({}))
        const root = new InjectionContext()
        const german = new InjectionContext([provide(Locale$, 'de')], root)
        const store = inject(Store$, root)
        const germanStore = inject(Store$, german)

        expect(store.api.locale).toBe('en')
        expect(germanStore.api.locale).toBe('de')
        expect(inject(Api$, german)).toBe(germanStore.api)
        expect(inject(Other$, german)).toBe(inject(Other$, root))
        expect(Other$).toHaveBeenCalledTimes(1)
      })

      it('should not take resolved dependency for provided one', () => {
        const Nav$ = vi.fn(() => ({}))
        const Outlet$ = vi.fn((): unknown => null)
        const Paths$ = vi.fn(() => ({
          nav: inject(Nav$)
        }))
        const Link$ = vi.fn(() => ({
          paths: inject(Paths$)
        }))
        const root = new InjectionContext([provide(Nav$, {})])
        const layout = new InjectionContext([provide(Outlet$, 1)], root)
        const paths = inject(Paths$, layout)
        const link = inject(Link$, new InjectionContext([provide(Outlet$, 2)], layout))

        expect(link.paths).toBe(paths)
        expect(root.deps.has(Link$)).toBe(true)
        expect(inject(Link$, root)).toBe(link)
        expect(Paths$).toHaveBeenCalledTimes(1)
        expect(Link$).toHaveBeenCalledTimes(1)
      })

      it('should resolve null and undefined once', () => {
        const Null$ = vi.fn(() => null)
        const Undefined$ = vi.fn(() => undefined)
        const root = new InjectionContext()
        const child = new InjectionContext([], root)

        expect(inject(Null$, child)).toBe(null)
        expect(inject(Null$, child)).toBe(null)
        expect(inject(Null$, root)).toBe(null)
        expect(inject(Undefined$, child)).toBeUndefined()
        expect(inject(Undefined$, child)).toBeUndefined()
        expect(inject(Undefined$, root)).toBeUndefined()
        expect(Null$).toHaveBeenCalledTimes(1)
        expect(Undefined$).toHaveBeenCalledTimes(1)
      })

      it('should inject provided undefined', () => {
        const User$ = vi.fn((): object | undefined => ({}))
        const root = new InjectionContext()
        const anonymous = new InjectionContext([provide(User$, undefined)], root)

        inject(User$, root)

        expect(inject(User$, new InjectionContext([], anonymous))).toBeUndefined()
        expect(User$).toHaveBeenCalledTimes(1)
      })

      it('should see value set on the top context', () => {
        const Value$ = vi.fn(() => 'default')
        const Store$ = vi.fn(() => ({
          value: inject(Value$)
        }))
        const root = new InjectionContext()

        root.deps.set(Value$, 'set')

        const store = inject(Store$, new InjectionContext([], root))

        expect(store.value).toBe('set')
        expect(inject(Store$, root)).toBe(store)
        expect(Value$).not.toHaveBeenCalled()
      })

      it('should create dependency again after its factory has thrown', () => {
        let fail = true
        const Store$ = vi.fn(() => {
          if (fail) {
            throw new Error('fail')
          }

          return {}
        })
        const root = new InjectionContext()
        const child = new InjectionContext([], root)

        expect(() => inject(Store$, child)).toThrow()
        expect(getContext()).toBeUndefined()

        fail = false

        expect(inject(Store$, child)).toBe(inject(Store$, root))
        expect(Store$).toHaveBeenCalledTimes(2)
      })

      it('should remember what was injected before an error', () => {
        const Missing$ = vi.fn((): string => {
          throw new Error('missing')
        })
        const Inner$ = vi.fn(() => inject(Missing$))
        const Outer$ = vi.fn(() => {
          try {
            return inject(Inner$)
          } catch {
            return 'fallback'
          }
        })
        const root = new InjectionContext()

        expect(inject(Outer$, root)).toBe('fallback')
        expect(inject(Outer$, new InjectionContext([provide(Missing$, 'found')], root))).toBe('found')
        expect(inject(Outer$, root)).toBe('fallback')
      })

      it('should remember what was injected in another context', () => {
        const Flag$ = vi.fn(() => false)
        const Extra$ = vi.fn(() => 'extra')
        const Store$ = vi.fn(() => ({
          extra: inject(Flag$) ? inject(Extra$) : null
        }))
        const flagged = new InjectionContext([provide(Flag$, true), provide(Extra$, 'x')])

        expect(inject(Store$, flagged).extra).toBe('x')
        // the factory injects less here
        expect(inject(Store$, new InjectionContext()).extra).toBe(null)
        expect(inject(Store$, new InjectionContext([provide(Extra$, 'y')], flagged)).extra).toBe('y')
      })

      it('should not leak dependency above the context its dependency is created in', () => {
        const Locale$ = vi.fn(() => 'en')
        const Api$ = vi.fn(() => ({
          locale: inject(Locale$)
        }))
        const Store$ = vi.fn(() => ({
          api: inject(Api$)
        }))
        const root = new InjectionContext()
        const german = new InjectionContext([provide(Locale$, 'de')], root)

        // what Api$ injects is not known yet: it is provided here
        inject(Store$, new InjectionContext([provide(Api$, {
          locale: 'mock'
        })]))

        expect(inject(Store$, new InjectionContext([], german)).api.locale).toBe('de')
        expect(german.deps.has(Store$)).toBe(true)
        expect(root.deps.has(Store$)).toBe(false)
        expect(inject(Store$, root).api.locale).toBe('en')
      })

      it('should not remember what is injected after the dependency is created', () => {
        const Late$ = vi.fn(() => 'late')
        const Store$ = vi.fn(() => ({}))
        const root = new InjectionContext()
        const store = inject(Store$, root)

        inject(Late$, root)

        expect(inject(Store$, new InjectionContext([provide(Late$, 'provided')], root))).toBe(store)
        expect(Store$).toHaveBeenCalledTimes(1)
      })

      it('should create class dependency anew under the override of what it injects', () => {
        const Api$ = vi.fn(() => 'api')

        class Store$ extends Injectable$ {
          api = inject(Api$)
        }

        class Shared$ extends Injectable$ {}

        const root = new InjectionContext()
        const mocked = new InjectionContext([provide(Api$, 'mock')], root)

        expect(inject(Store$, root).api).toBe('api')
        expect(inject(Store$, mocked).api).toBe('mock')
        expect(inject(Shared$, mocked)).toBe(inject(Shared$, root))
      })

      it('should take the provided dependency above the context that overrides what it injects', () => {
        const Locale$ = vi.fn(() => 'en')
        const Api$ = vi.fn(() => ({
          locale: inject(Locale$)
        }))
        const mock = {
          locale: 'mock'
        }

        // what Api$ injects is known: it has been created elsewhere
        inject(Api$, new InjectionContext())

        const root = new InjectionContext([provide(Api$, mock)])
        const cached = new InjectionContext([], root)

        expect(inject(Api$, cached)).toBe(mock)
        expect(inject(Api$, new InjectionContext([provide(Locale$, 'de')], cached))).toBe(mock)
        expect(Api$).toHaveBeenCalledTimes(1)
      })

      it('should create dependency anew where the dependency it failed to inject is provided', () => {
        const Feature$ = vi.fn((): string => {
          throw new Error('not provided')
        })
        const Optional$ = vi.fn(() => {
          try {
            return inject(Feature$)
          } catch {
            return null
          }
        })
        const root = new InjectionContext()

        expect(inject(Optional$, root)).toBe(null)
        expect(inject(Optional$, new InjectionContext([provide(Feature$, 'feature')], root))).toBe('feature')
        expect(inject(Optional$, root)).toBe(null)
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
        const scope = deferScope(() => {
          value = inject(Factory$, context)
          value = inject(Factory$, context)
        })

        expect(value).toBe(42)
        expect(Factory$).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(destroy).not.toHaveBeenCalled()

        startScope(scope)

        expect(Factory$).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(destroy).not.toHaveBeenCalled()

        stopScope(scope)

        expect(Factory$).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(destroy).not.toHaveBeenCalled()
      })
    })

    describe('get with lookup', () => {
      it('should return provided dependency without calling its factory', () => {
        const Value$ = vi.fn(() => 'default')
        const root = new InjectionContext([provide(Value$, 'provided')])

        expect(new InjectionContext([], root).get(Value$, true)).toBe('provided')
        expect(Value$).not.toHaveBeenCalled()
      })

      it('should return undefined without creating the dependency', () => {
        const Store$ = vi.fn(() => ({}))
        const context = new InjectionContext()

        expect(context.get(Store$, true)).toBeUndefined()
        expect(Store$).not.toHaveBeenCalled()
        expect(context.deps.has(Store$)).toBe(false)
      })

      it('should return dependency created above', () => {
        const Store$ = vi.fn(() => ({}))
        const root = new InjectionContext()
        const store = inject(Store$, root)

        expect(new InjectionContext([], root).get(Store$, true)).toBe(store)
        expect(Store$).toHaveBeenCalledTimes(1)
      })

      it('should keep no copy in the requesting context', () => {
        const Store$ = vi.fn(() => ({}))
        const root = new InjectionContext()
        const store = inject(Store$, root)
        const child = new InjectionContext([], root)

        expect(child.get(Store$, true)).toBe(store)
        expect(child.deps.has(Store$)).toBe(false)
      })

      it('should return undefined under the override of what the created dependency injects', () => {
        const Theme$ = vi.fn(() => 'light')
        const Store$ = vi.fn(() => ({
          theme: inject(Theme$)
        }))
        const root = new InjectionContext()
        const dark = new InjectionContext([provide(Theme$, 'dark')], root)

        inject(Store$, root)

        expect(dark.get(Store$, true)).toBeUndefined()
        expect(inject(Store$, dark).theme).toBe('dark')
        expect(dark.get(Store$, true)).toBe(inject(Store$, dark))
      })

      it('should count found dependency as read by the factory', () => {
        const Feature$ = vi.fn((): string => {
          throw new Error('not provided')
        })
        const Optional$ = vi.fn(() => getContext()!.get(Feature$, true) ?? 'none')
        const root = new InjectionContext()

        expect(inject(Optional$, root)).toBe('none')
        expect(inject(Optional$, new InjectionContext([provide(Feature$, 'feature')], root))).toBe('feature')
        expect(Feature$).not.toHaveBeenCalled()
      })
    })

    describe('provideAs', () => {
      it('should resolve the token as the alias and share its instance', () => {
        const Api$ = vi.fn(() => ({
          name: 'real'
        }))
        const MockApi$ = vi.fn(() => ({
          name: 'mock'
        }))
        const context = new InjectionContext([provideAs(Api$, MockApi$)])

        expect(inject(Api$, context)).toBe(inject(MockApi$, context))
        expect(inject(Api$, context)).toBe(inject(Api$, context))
        expect(Api$).not.toHaveBeenCalled()
        expect(MockApi$).toHaveBeenCalledTimes(1)
      })

      it('should create the alias again under the override of what it injects', () => {
        const Locale$ = vi.fn(() => 'en')
        const Api$ = vi.fn(() => ({
          locale: 'real'
        }))
        const MockApi$ = vi.fn(() => ({
          locale: inject(Locale$)
        }))
        const root = new InjectionContext([provideAs(Api$, MockApi$)])
        const german = new InjectionContext([provide(Locale$, 'de')], root)

        expect(inject(Api$, root).locale).toBe('en')
        expect(inject(Api$, german).locale).toBe('de')
        expect(inject(Api$, root).locale).toBe('en')
        expect(Api$).not.toHaveBeenCalled()
      })

      it('should create the alias again below a context that has cached it', () => {
        const Locale$ = vi.fn(() => 'en')
        const Api$ = vi.fn(() => ({
          locale: 'real'
        }))
        const MockApi$ = vi.fn(() => ({
          locale: inject(Locale$)
        }))
        const root = new InjectionContext([provideAs(Api$, MockApi$)])
        const middle = new InjectionContext([], root)

        expect(inject(Api$, middle).locale).toBe('en')
        expect(inject(Api$, new InjectionContext([provide(Locale$, 'de')], middle)).locale).toBe('de')
      })

      it('should keep what injects the token within the context of the alias', () => {
        const Api$ = vi.fn(() => ({
          name: 'real'
        }))
        const MockApi$ = vi.fn(() => ({
          name: 'mock'
        }))
        const Store$ = vi.fn(() => ({
          api: inject(Api$)
        }))
        const root = new InjectionContext()
        const mocked = new InjectionContext([provideAs(Api$, MockApi$)], root)

        expect(inject(Store$, mocked).api).toBe(inject(MockApi$, mocked))
        expect(inject(Store$, root).api).toBe(inject(Api$, root))
        expect(inject(Store$, root)).not.toBe(inject(Store$, mocked))
      })

      it('should give way to a value provided below and override one provided above', () => {
        const Api$ = vi.fn(() => ({}))
        const MockApi$ = vi.fn(() => ({}))
        const above = {}
        const below = {}
        const root = new InjectionContext([provide(Api$, above)])
        const aliased = new InjectionContext([provideAs(Api$, MockApi$)], root)

        expect(inject(Api$, aliased)).toBe(inject(MockApi$, aliased))
        expect(inject(Api$, new InjectionContext([provide(Api$, below)], aliased))).toBe(below)
        expect(inject(Api$, root)).toBe(above)
        expect(Api$).not.toHaveBeenCalled()
      })

      it('should be found without creating the alias', () => {
        const Api$ = vi.fn(() => ({}))
        const MockApi$ = vi.fn(() => ({}))
        const context = new InjectionContext([provideAs(Api$, MockApi$)])

        expect(context.get(Api$, true)).toBeUndefined()
        expect(MockApi$).not.toHaveBeenCalled()

        const api = inject(Api$, context)

        expect(context.get(Api$, true)).toBe(api)
        expect(new InjectionContext([], context).get(Api$, true)).toBe(api)
      })

      it('should resolve the alias for a token that was found below before the alias was created', () => {
        const Api$ = vi.fn(() => ({}))
        const MockApi$ = vi.fn(() => ({}))
        const context = new InjectionContext([provideAs(Api$, MockApi$)])
        const child = new InjectionContext([], context)

        expect(child.get(Api$, true)).toBeUndefined()
        expect(inject(Api$, child)).toBe(inject(MockApi$, context))
      })

      it('should let the alias provided last win over a value provided before it', () => {
        const Api$ = vi.fn(() => ({}))
        const MockApi$ = vi.fn(() => ({}))
        const context = new InjectionContext([provide(Api$, {}), provideAs(Api$, MockApi$)])

        expect(inject(Api$, context)).toBe(inject(MockApi$, context))
        expect(inject(Api$, new InjectionContext([], context))).toBe(inject(MockApi$, context))
      })

      it('should let the alias provided last win over an alias provided before it', () => {
        const Api$ = vi.fn(() => ({}))
        const OtherApi$ = vi.fn(() => ({}))
        const MockApi$ = vi.fn(() => ({}))
        const context = new InjectionContext([provideAs(Api$, OtherApi$), provideAs(Api$, MockApi$)])

        expect(inject(Api$, context)).toBe(inject(MockApi$, context))
        expect(OtherApi$).not.toHaveBeenCalled()
      })

      it('should let the value provided last win over an alias provided before it', () => {
        const Api$ = vi.fn(() => ({}))
        const MockApi$ = vi.fn(() => ({}))
        const value = {}
        const context = new InjectionContext([provideAs(Api$, MockApi$), provide(Api$, value)])

        expect(inject(Api$, context)).toBe(value)
        expect(inject(Api$, new InjectionContext([], context))).toBe(value)
        expect(MockApi$).not.toHaveBeenCalled()
      })
    })
  })
})
