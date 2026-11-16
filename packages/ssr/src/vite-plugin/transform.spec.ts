import {
  describe,
  it,
  expect
} from 'vitest'
import { parseSync } from 'vite'
import { transformClient } from './transform.js'

function transform(code: string) {
  return transformClient(null, parseSync('page.js', code).program, code)?.code ?? null
}

describe('ssr', () => {
  describe('vite-plugin', () => {
    describe('transform', () => {
      describe('transformClient', () => {
        it('should remove Stores$ from a module with a default export', () => {
          const code = transform(`
            export function Stores$() {
              return [$data]
            }

            export default function Page() {}
          `)

          expect(code).not.toContain('Stores$')
          expect(code).toContain('export default function Page() {}')
        })

        it('should keep Stores$, Cache$ and StatusCode$ in a module without a default export', () => {
          expect(transform(`
            export function Stores$() {
              return [$data]
            }

            export function Cache$() {
              return new Map()
            }

            export function StatusCode$() {
              return signal('idle')
            }

            export function Page() {}
          `)).toBeNull()
        })

        it('should take an export named default for the default export', () => {
          const code = transform(`
            function Page() {}

            export function Stores$() {
              return [$data]
            }

            export { Page as default }
          `)

          expect(code).not.toContain('Stores$')
        })

        it('should remove Stores$ that only lists injected stores', () => {
          const code = transform(`
            export function Stores$() {
              return [inject(Data$), ...inject(BlockStores$)]
            }

            export default function Page() {}
          `)

          expect(code).not.toContain('function Stores$')
        })

        it('should remove Stores$ declared as a variable', () => {
          const code = transform(`
            export const Stores$ = () => {
              return [$data]
            }

            export default function Page() {}
          `)

          expect(code).not.toContain('Stores$')
        })

        it('should remove Stores$ declared as an arrow function that returns an expression', () => {
          const code = transform(`
            export const Stores$ = () => [$data]

            export default function Page() {}
          `)

          expect(code).not.toContain('Stores$')
        })

        it('should remove Cache$ and StatusCode$ from a module with a default export', () => {
          const code = transform(`
            export function Cache$() {
              return true
            }

            export function StatusCode$() {
              return 404
            }

            export default function Page() {}
          `)

          expect(code).not.toContain('Cache$')
          expect(code).not.toContain('StatusCode$')
        })

        it('should keep Stores$ that is not a function', () => {
          expect(transform(`
            export const Stores$ = []

            export default function Page() {}
          `)).toBeNull()
        })

        it('should remove Stores$ from a list of exports', () => {
          const code = transform(`
            function Stores$() {
              return [$data]
            }

            function Page() {}

            export { Stores$, Page }

            export default Page
          `)

          expect(code).toContain('export { Page }')
        })

        it('should remove several names from one list of exports', () => {
          const code = transform(`
            function Stores$() {
              return [$data]
            }

            function StatusCode$() {
              return 404
            }

            function Page() {}

            export { Stores$, Page as default, StatusCode$ }
          `)

          expect(code).toContain('export { Page as default }')
        })

        it('should remove a list of exports left empty', () => {
          const code = transform(`
            function Stores$() {
              return [$data]
            }

            export { Stores$ }

            export default function Page() {}
          `)

          expect(code).not.toContain('export {')
        })

        it('should remove Stores$ and StatusCode$ re-exported from another module', () => {
          const code = transform(`
            export { Stores$, StatusCode$, Head$ } from './page.stores.js'

            export default function Page() {}
          `)

          expect(code).toContain("export { Head$ } from './page.stores.js'")
        })

        it('should keep a module without the names as it is', () => {
          expect(transform(`
            export function PageStores$() {
              return [$data]
            }

            export default function Page() {}
          `)).toBeNull()
        })
      })
    })
  })
})
