import { isLibrary } from './naming.stack.js'

/**
 * The library rule for this workspace, where the core and the panel are plain source files next
 * to the specs, not installed packages: they are told apart by their folders. Specs and mocks
 * play the application. A file comes as a path on the disk under Vitest and as a URL of the dev
 * server under Storybook, where the package is the root: `http://localhost:6006/src/services/…`
 * for its own sources, `…/@fs/…/packages/agera/src/…` for the core, and `…/sb-vite/deps/…` for
 * what Storybook bundled ahead, which sits outside `node_modules` when its cache is moved.
 * @param file
 * @returns Whether the file belongs to a library.
 */
export function isWorkspaceLibrary(file: string) {
  return isLibrary(file)
    || /\/packages\/(?:agera|kida|store)\/|\/sb-vite\/deps\//.test(file)
    || /\/src\/(?:services|stores)\/(?!.*\.(?:spec|mock)\.)/.test(file)
}
