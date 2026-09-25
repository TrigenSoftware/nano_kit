import {
  describe,
  it,
  expect,
  beforeEach
} from 'vitest'
import {
  InjectionContext,
  provide,
  inject
} from '@nano_kit/store'
import { isLibrary } from './naming.stack.js'
import {
  LibraryDetector$,
  NamingService$
} from './naming.js'
import { isWorkspaceLibrary } from './naming.mock.js'

describe('devtools', () => {
  describe('services', () => {
    describe('naming', () => {
      describe('LibraryDetector$', () => {
        it('should default to the rule of installed packages', () => {
          expect(inject(LibraryDetector$, new InjectionContext())).toBe(isLibrary)
        })
      })

      describe('isWorkspaceLibrary', () => {
        it('should tell the core and the panel from the application, on the disk and on the dev server', () => {
          const library = [
            '/workspace/nano_kit/packages/agera/src/internals/system.ts',
            '/workspace/nano_kit/packages/devtools/src/services/naming/naming.ts',
            'http://localhost:6006/@fs/workspace/nano_kit/packages/kida/src/internals/child.ts',
            'http://localhost:6006/@fs/workspace/nano_kit/packages/store/src/map.ts',
            'http://localhost:6006/src/services/naming/naming.ts',
            'http://localhost:6006/src/stores/registry.ts',
            'http://localhost:6006/node_modules/.cache/storybook/deps/nanoviews.js',
            'http://localhost:6006/@fs/cache/storybook/10.6.0/0d57/sb-vite/deps/nanoviews_store.js'
          ]
          const application = [
            '/workspace/nano_kit/packages/devtools/src/services/naming/naming.mock.ts',
            '/workspace/nano_kit/packages/devtools/src/stores/registry.spec.ts',
            'http://localhost:6006/src/services/naming/naming.mock.ts',
            'http://localhost:6006/src/blocks/shared/app.mock.ts'
          ]

          expect(library.filter(isWorkspaceLibrary)).toEqual(library)
          expect(application.filter(isWorkspaceLibrary)).toEqual([])
        })
      })

      describe('NamingService$', () => {
        let naming: NamingService$

        beforeEach(() => {
          naming = inject(NamingService$, new InjectionContext([provide(LibraryDetector$, isWorkspaceLibrary)]))
        })

        it('should name a node after the function and the place its stack was captured in', () => {
          function Cart$() {
            return naming.capture()
          }

          const name = naming.name(1, Cart$())

          expect(name.name).toMatch(/^[a-z]+-[a-z]+$/)
          expect(name.owner).toBe('Cart$')
          expect(name.site).toMatch(/^naming\.spec\.ts:\d+$/)
          expect(name.file).toMatch(/\/naming\.spec\.ts$/)
          expect(name.adapter).toBeUndefined()
        })

        it('should give the nodes of one place different names', () => {
          function create() {
            return naming.capture()
          }

          const first = naming.name(1, create())
          const second = naming.name(2, create())

          expect(first.site).toBe(second.site)
          expect(first.name).not.toBe(second.name)
        })

        it('should name a child after its parent and its key', () => {
          const parent = naming.name(1, naming.capture())

          expect(naming.name(2, naming.capture(), parent, 'name').name).toBe(`${parent.name}.$name`)
          expect(naming.name(3, naming.capture(), parent, 0).name).toBe(`${parent.name}[0]`)
          // A key given as an accessor is not read
          expect(naming.name(4, naming.capture(), parent, () => 0).name).toBe(`${parent.name}[…]`)
        })

        it('should give a node libraries created inside the body of another the owner and the file of that one', () => {
          function Cache$() {
            return naming.capture()
          }

          const runner = naming.name(1, Cache$())
          // An entry a cache creates as its computed runs: libraries alone from the body up
          const trace = {
            stack: `Error
    at createSignal (http://localhost:5173/node_modules/.vite/deps/chunk.js:301:3)
    at callInspected (http://localhost:5173/node_modules/.vite/deps/chunk.js:135:15)
    at Weather (http://localhost:5173/src/Weather.tsx:11:23)`,
            count: 1,
            origin: undefined
          }
          const name = naming.name(2, [trace, 1], undefined, undefined, runner)

          expect(name.owner).toBe('Cache$')
          expect(name.file).toBe(runner.file)
          expect(name.site).toBeUndefined()
        })

        it('should name a node the application created after its own frame, whatever body was running', () => {
          function Cart$() {
            return naming.capture()
          }

          const runner = naming.name(1, naming.capture())

          expect(naming.name(2, Cart$(), undefined, undefined, runner).owner).toBe('Cart$')
        })

        it('should leave a node without an origin without a site', () => {
          const name = naming.name(7)

          expect(name.name).toMatch(/^[a-z]+-[a-z]+/)
          expect(name.site).toBeUndefined()
          expect(name.file).toBeUndefined()
          expect(name.owner).toBeUndefined()
        })
      })
    })
  })
})
