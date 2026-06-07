import {
  type Queries,
  type queries as defaultQueries,
  getQueriesForElement,
  prettyDOM
} from '@testing-library/dom'
import {
  type Child,
  type Destroy,
  mount
} from 'nanoviews'

export * from '@testing-library/dom'

// oxlint-disable-next-line typescript/no-explicit-any
type BlockCreator = readonly [(...args: any[]) => Child, ...unknown[]]

type App = () => Child

interface ContainerCacheEntry {
  container: HTMLElement
  target: HTMLElement
  unmount: Destroy
}

export interface RenderOptions<Q extends Queries = typeof defaultQueries> {
  target?: HTMLElement
  container?: HTMLElement
  queries?: Q
}

const containerCache = new Set<ContainerCacheEntry>()
const unmountCache = new Set<Destroy>()

/**
 * Render a Component Block into the Document.
 * @param blockCreator - The Component Block to render or a block creator
 * @param renderOptions - Options to customize the render
 * @returns An object with utilities to interact with the rendered block
 */
export function render<Q extends Queries = typeof defaultQueries>(blockCreator: BlockCreator | App, renderOptions: RenderOptions<Q> = {}) {
  const { queries } = renderOptions
  const container = renderOptions.container || document.body
  const target = renderOptions.target || container.appendChild(document.createElement('div'))
  let unmount: Destroy

  try {
    if (Array.isArray(blockCreator)) {
      const [creator, ...args] = blockCreator as BlockCreator

      unmount = mount(() => creator(...args), target)
    } else if (typeof blockCreator === 'function') {
      unmount = mount(() => blockCreator(), target)
    } else {
      throw new Error('Invalid block creator. Expected a function.')
    }
  } catch (error) {
    if (target.parentNode === document.body) {
      document.body.removeChild(target)
    }

    throw error
  }

  containerCache.add({
    container,
    target,
    unmount
  })
  unmountCache.add(unmount)

  return {
    container,
    debug(el: HTMLElement = container) {
      console.log(prettyDOM(el))
    },
    destroy() {
      if (unmountCache.has(unmount)) {
        unmount()
        unmountCache.delete(unmount)
      }
    },
    ...getQueriesForElement<Q>(container, queries)
  }
}

function cleanupAtContainer(cached: ContainerCacheEntry) {
  const { target, unmount } = cached

  if (unmountCache.has(unmount)) {
    // Block can be destroyed in the test
    try {
      unmount()
    } finally {
      unmountCache.delete(unmount)
    }
  }

  if (target.parentNode === document.body) {
    document.body.removeChild(target)
  }

  containerCache.delete(cached)
}

/**
 * Unmounts trees that were mounted with render.
 */
export function cleanup() {
  for (const cached of containerCache) {
    cleanupAtContainer(cached)
  }
}
