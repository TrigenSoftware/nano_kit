import {
  type DeferredScope,
  batch,
  deferScope,
  startScope,
  stopScope
} from 'kida'
import {
  type Child,
  type MaybeDestroy,
  mountChild
} from './internals/index.js'

/**
 * Mount an app into a node
 * @param app - App function to mount app
 * @param target - The node to mount into
 * @returns A function to unmount the app
 */
export function mount(app: () => Child, target: ParentNode) {
  let unmount: MaybeDestroy
  let scope!: DeferredScope

  // Batch defers render- and destroy-time signal writes until the phase completes
  batch(
    () => startScope(
      scope = deferScope(() => unmount = mountChild(target, app()))
    )
  )

  return () => {
    batch(() => stopScope(scope))
    unmount?.()
  }
}
