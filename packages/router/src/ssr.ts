import { type Accessor } from '@nano_kit/store'
import type { Routes } from './types.js'
import type {
  PageMatchRef,
  LayoutMatchRef,
  PageRef,
  UnknownMatchRef,
  UnknownPageMatchRef,
  UnknownComposer,
  CacheFactory,
  MatchRef
} from './router.types.js'

/**
 * Precomposes the given pages with the provided compose function. This is useful for server-side rendering, where you want to compose the page components with the layout components before rendering.
 * @param pages - Array of page and layout match references
 * @param compose - Function to compose layouts with outlet content
 */
export function precompose<R extends Routes, K extends keyof R & string, P, N, L, C>(
  pages: (
    | PageMatchRef<NoInfer<K>, P>
    | PageMatchRef<null, P>
    | LayoutMatchRef<NoInfer<K>, N, L>
  )[],
  compose: ($outlet: Accessor<N | null>, layout: L) => C
): void

export function precompose<R extends Routes, K extends keyof R & string, P, N, L, C>(
  pages: (
    | PageMatchRef<NoInfer<K>, P>
    | PageMatchRef<null, P>
    | LayoutMatchRef<NoInfer<K>, N, L>
  )[],
  compose: ($outlet: Accessor<N | null>, layout: L) => C,
  parentLayouts: PageRef<unknown>[]
): (
  | PageMatchRef<NoInfer<K>, P>
  | PageMatchRef<null, P>
)[]

export function precompose(
  pages: UnknownMatchRef[],
  compose: UnknownComposer,
  parentLayouts?: PageRef<unknown>[]
): UnknownPageMatchRef[] | void {
  const result: UnknownPageMatchRef[] = []

  for (const ref of pages) {
    if ('expected' in ref) {
      const pageRef = ref.page()

      if (!parentLayouts) {
        result.push(ref)
      } else {
        const composed = composeWithLayouts(pageRef, parentLayouts, compose)

        result.push({
          expected: ref.expected,
          page: () => composed
        })
      }
    } else {
      const layoutRef = ref.layout()

      result.push(
        ...precompose(ref.pages, compose, [...parentLayouts || [], layoutRef])
      )
    }
  }

  if (parentLayouts) {
    return result
  }

  pages.length = 0
  pages.push(...result)
}

function composeWithLayouts(
  pageRef: PageRef<unknown>,
  layouts: PageRef<unknown>[],
  compose: UnknownComposer
): PageRef<unknown> {
  let current = pageRef

  for (let i = layouts.length - 1, layout; i >= 0; i--) {
    const inner = current

    layout = layouts[i]
    current = {
      default: compose(() => inner.default, layout.default),
      Stores$: composeArrayFns(layout.Stores$, inner.Stores$),
      Head$: composeArrayFns(layout.Head$, inner.Head$),
      Cache$: composeCache(layout.Cache$, inner.Cache$),
      __chunks: composeChunks(layout.__chunks, inner.__chunks),
      statusCode: inner.statusCode ?? layout.statusCode
    }
  }

  return current
}

const noopArray = () => []

function composeArrayFns<T>(
  outer: (() => T[]) | undefined,
  inner: (() => T[]) | undefined
): () => T[] {
  return outer && inner
    ? () => [...outer(), ...inner()]
    : outer || inner || noopArray
}

const noopCache = () => false

function composeCache(
  outer: CacheFactory | undefined,
  inner: CacheFactory | undefined
): CacheFactory {
  return outer && inner
    ? () => {
      const l = outer()

      if (!l) {
        return l
      }

      const r = inner()

      if (typeof l === 'object' && typeof r === 'object') {
        return {
          ...l,
          ...r
        }
      }

      return r
    }
    : outer || inner || noopCache
}

function composeChunks(
  outer: string[] = [],
  inner: string[] = []
): string[] {
  return [...outer, ...inner]
}

/**
 * Load all lazy pages in the pages reference tree.
 * @param pages - Pages reference tree
 * @returns Promise that resolves when all pages are loaded
 */
export async function loadPages(
  pages: UnknownMatchRef[],
  tasks?: Set<Promise<unknown>>
): Promise<void> {
  const allTasks = tasks ?? new Set()

  for (const ref of pages) {
    if ('expected' in ref) {
      ref.page(allTasks)
    } else {
      ref.layout(allTasks)
      void loadPages(ref.pages, allTasks)
    }
  }

  if (!tasks) {
    await Promise.all(allTasks)
  }
}

/**
 * Load a specific lazy page by route in the pages reference tree.
 * @param pages - Pages reference tree
 * @param route - Route name to load
 * @returns Promise that resolves when the page is loaded
 */
export async function loadPage<R extends Routes, K extends keyof R & string, P, L>(
  pages: MatchRef<K, P, L>[],
  route: K | null,
  tasks?: Set<Promise<unknown> | null>
): Promise<void> {
  const allTasks = tasks ?? new Set()

  for (const ref of pages) {
    if ('expected' in ref) {
      if (ref.expected === route) {
        ref.page(allTasks)
        // Page can be not async loadable
        allTasks.add(null)
        break
      }
    } else
      if (allTasks.size < (loadPage(ref.pages, route, allTasks), allTasks.size)) {
        ref.layout(allTasks)
        break
      }
  }

  if (!tasks) {
    await Promise.all(allTasks)
  }
}
