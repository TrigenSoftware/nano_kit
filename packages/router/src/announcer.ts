import {
  type Accessor,
  type InjectionContext,
  effect,
  get
} from '@nano_kit/store'
import type { PageRef } from './router.types.js'
import { pageTitle } from './head.js'

/**
 * Creates a title announcer: it announces each new title of the current page to assistive technologies, through a polite live region in a shadow root at the end of the body.
 * The title the document opened with is not announced, as screen readers announce a loaded document themselves, and a page is announced once it has loaded.
 * A title is announced once it has held for 100 ms, so a title the page refines at once is announced refined.
 * A page without a title is announced by its first `h1`.
 * @param $page - Accessor for the current page reference.
 * @param context - Optional injection context to resolve head factories.
 * @returns Cleanup function to stop announcing and remove the live region.
 */
export function titleAnnouncer(
  $page: Accessor<PageRef<unknown> | null>,
  context?: InjectionContext
) {
  const host = document.createElement('nano-kit-title-announcer')
  const region = document.createElement('div')
  const $title = pageTitle($page, context)
  // The title announced last
  let announced = get($title)

  // In a shadow root, no style or query of the page reaches the region: a test looking up its
  // own status region by role finds no second one. A custom tag keeps rules for divs off the host.
  host.attachShadow({
    mode: 'open'
  }).append(region)
  host.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap'
  region.role = 'status'
  document.body.append(host)

  // Created after the state it reads, as it runs at once
  const stop = effect(() => {
    const title = $title()
    const loading = $page()?.loading

    // A title is announced once it has held for 100 ms: each change, a page on its way
    // included, runs the cleanup that drops the announcement pending. Safari misses text
    // that comes too soon after a change, and by then the view has rendered the heading
    // a page without a title is announced by.
    if (!loading && title !== announced) {
      const timer = setTimeout(() => {
        announced = title
        region.textContent = title || document.querySelector('h1')?.textContent || ''
      }, 100)

      return () => clearTimeout(timer)
    }
  })

  return () => {
    stop()
    host.remove()
  }
}
