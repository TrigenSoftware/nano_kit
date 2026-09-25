import {
  describe,
  it,
  expect
} from 'vitest'
import {
  basename,
  isLibrary,
  locate,
  parseStack
} from './naming.stack.js'

const V8 = `Error
    at Naming.#trace (http://localhost:5173/node_modules/.vite/deps/@nano_kit_devtools.js?v=1f0c:412:19)
    at createSignal (http://localhost:5173/node_modules/.vite/deps/chunk-7GX2ABCD.js?v=1f0c:301:3)
    at signal (http://localhost:5173/node_modules/.vite/deps/chunk-7GX2ABCD.js?v=1f0c:320:10)
    at Cart$ (http://localhost:5173/src/stores/cart.ts?t=1726000000000:18:22)
    at InjectionContext.get [as get] (http://localhost:5173/node_modules/.vite/deps/kida.js?v=1f0c:120:15)
    at async Promise.all (index 0)
    at http://localhost:5173/src/main.ts:5:1`
const FIREFOX = `#trace@http://localhost:5173/node_modules/.vite/deps/@nano_kit_devtools.js?v=1f0c:412:19
createSignal@http://localhost:5173/node_modules/.vite/deps/chunk-7GX2ABCD.js?v=1f0c:301:3
Cart$/<@http://localhost:5173/src/stores/cart.ts?t=1726000000000:18:22
async*load@http://localhost:5173/src/stores/cart.ts:40:9
@http://localhost:5173/src/main.ts:5:1`
const SAFARI = `createSignal@http://localhost:5173/node_modules/.vite/deps/chunk-7GX2ABCD.js:301:12
Cart$@http://localhost:5173/src/stores/cart.ts:18:28
[native code]
module code@http://localhost:5173/src/main.ts:5:1`
const SUBSCRIPTION = `Error
    at link (http://localhost:5173/node_modules/.vite/deps/chunk-7GX2ABCD.js?v=1f0c:190:5)
    at subscribe (http://localhost:5173/node_modules/.vite/deps/@nano_kit_react.js?v=1f0c:31:12)
    at subscribeToStore (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=1f0c:6120:10)
    at commitHookEffectListMount (http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=1f0c:8460:26)`

describe('devtools', () => {
  describe('services', () => {
    describe('naming', () => {
      describe('parseStack', () => {
        it('should parse the frames of a V8 stack and skip the lines without a position', () => {
          expect(parseStack(V8)).toEqual([
            {
              fn: 'Naming.#trace',
              file: 'http://localhost:5173/node_modules/.vite/deps/@nano_kit_devtools.js',
              line: 412,
              column: 19
            },
            {
              fn: 'createSignal',
              file: 'http://localhost:5173/node_modules/.vite/deps/chunk-7GX2ABCD.js',
              line: 301,
              column: 3
            },
            {
              fn: 'signal',
              file: 'http://localhost:5173/node_modules/.vite/deps/chunk-7GX2ABCD.js',
              line: 320,
              column: 10
            },
            {
              fn: 'Cart$',
              file: 'http://localhost:5173/src/stores/cart.ts',
              line: 18,
              column: 22
            },
            {
              fn: 'InjectionContext.get',
              file: 'http://localhost:5173/node_modules/.vite/deps/kida.js',
              line: 120,
              column: 15
            },
            {
              fn: undefined,
              file: 'http://localhost:5173/src/main.ts',
              line: 5,
              column: 1
            }
          ])
        })

        it('should parse a Firefox stack and name a nested function after the one around it', () => {
          expect(parseStack(FIREFOX).map(frame => frame.fn)).toEqual([
            '#trace',
            'createSignal',
            'Cart$',
            'load',
            undefined
          ])
        })

        it('should parse a Safari stack without native and top-level code names', () => {
          expect(parseStack(SAFARI).map(frame => [frame.fn, frame.line])).toEqual([
            ['createSignal', 301],
            ['Cart$', 18],
            [undefined, 5]
          ])
        })

        it('should drop the prefixes of constructors and async functions', () => {
          const frames = parseStack(`Error
    at new CartStore (http://localhost:5173/src/cart.ts:3:5)
    at async Object.load (http://localhost:5173/src/cart.ts:9:1)
    at eval (eval at run (http://localhost:5173/src/cart.ts:1:1), <anonymous>:1:1)`)

          expect(frames.map(frame => frame.fn)).toEqual(['CartStore', 'load'])
        })

        it('should leave a body the core runs through its node unnamed in V8', () => {
          const frames = parseStack(`Error
    at Object.fn (http://localhost:5173/src/main.ts:8:3)
    at Object.compute (http://localhost:5173/src/main.ts:5:28)
    at Object.load (http://localhost:5173/src/cart.ts:9:1)`)

          expect(frames.map(frame => frame.fn)).toEqual([undefined, undefined, 'load'])
        })
      })

      describe('isLibrary', () => {
        it('should tell installed packages, pre-bundled dependencies and Node internals from the application', () => {
          expect(isLibrary('http://localhost:5173/node_modules/.vite/deps/kida.js')).toBe(true)
          expect(isLibrary('/app/node_modules/.pnpm/kida@2.0.0/node_modules/kida/dist/index.js')).toBe(true)
          expect(isLibrary('node:internal/process/task_queues')).toBe(true)
          expect(isLibrary('http://localhost:5173/src/stores/cart.ts')).toBe(false)
        })
      })

      describe('locate', () => {
        it('should find the first frame of the application', () => {
          expect(locate(parseStack(V8))).toEqual({
            frame: {
              fn: 'Cart$',
              file: 'http://localhost:5173/src/stores/cart.ts',
              line: 18,
              column: 22
            },
            adapter: undefined
          })
        })

        it('should name the adapter of a subscription made by a framework alone', () => {
          expect(locate(parseStack(SUBSCRIPTION))).toEqual({
            frame: undefined,
            adapter: 'react'
          })
        })

        it('should take the rule for libraries from the caller', () => {
          const origin = locate(parseStack(V8), file => !file.endsWith('/main.ts'))

          expect(origin.frame?.file).toBe('http://localhost:5173/src/main.ts')
        })
      })

      describe('basename', () => {
        it('should return the last segment of a path or a URL', () => {
          expect(basename('http://localhost:5173/src/stores/cart.ts')).toBe('cart.ts')
          expect(basename('cart.ts')).toBe('cart.ts')
        })
      })
    })
  })
})
