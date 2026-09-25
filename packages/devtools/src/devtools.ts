import {
  InjectionContext,
  inject,
  provide,
  uninspected,
  start
} from '@nano_kit/store'
import {
  context$,
  mount
} from 'nanoviews'
import styles from 'virtual:styles'
import sprite from './assets/sprite.svg?raw'
import {
  LibraryDetector$,
  isLibrary
} from './services/naming/index.js'
import { RegistryStore$ } from './stores/registry.js'
import { LogStore$ } from './stores/log.js'
import { Panel } from './blocks/Panel/index.js'

// The faces of Segoe UI the panel is set in, by their names on Windows. Its ascent is that much above its descent
// that it sets the baseline a pixel lower in a line than SF does: under the name of `--fontSans` they have
// the metrics that set it where SF does, their sum the same, so a line is as high as before
const SEGOE_UI: [weight: string, ...names: string[]][] = [
  ['400', 'Segoe UI', 'SegoeUI'],
  ['600', 'Segoe UI Semibold', 'SegoeUI-Semibold'],
  ['700', 'Segoe UI Bold', 'SegoeUI-Bold']
]

export interface DevtoolsOptions {
  /**
   * Which files are libraries besides the installed packages, those under `node_modules`: their frames
   * are skipped on the way to the code of the application that created a node, the one it is named by.
   * A workspace that links packages as sources needs it, or a node is named by a function of the kit.
   * @example
   * ```ts
   * devtools({
   *   library: file => file.includes('/packages/')
   * })
   * ```
   */
  library?: (file: string) => boolean
}

/**
 * Start the DevTools on the page: from this call on they follow every node the application creates
 * and every transaction it runs, and show them in a panel of their own at the bottom of the page.
 * Call it once, in development alone, before the application creates its stores: from a module
 * of its own imported first, since the modules imported before it create their nodes unseen.
 * @param options
 * @example
 * ```ts
 * import { devtools } from '@nano_kit/devtools'
 *
 * if (import.meta.env.DEV) {
 *   devtools()
 * }
 * ```
 */
export function devtools({ library }: DevtoolsOptions = {}) {
  // Whatever the DevTools create is theirs and never shows among the nodes of the application
  uninspected(() => {
    const context = new InjectionContext(library && [
      provide(LibraryDetector$, (file: string) => isLibrary(file) || library(file))
    ])
    const { records } = inject(RegistryStore$, context)
    const { $groups } = inject(LogStore$, context)
    const host = document.createElement('div')
    const shadow = host.attachShadow({
      mode: 'open'
    })
    const sheet = new CSSStyleSheet()

    // Both listen for good, the registry first: the log names the nodes by its records
    start(records.$index)
    start($groups)

    // Adopted, not a `<style>`: a page whose policy forbids inline styles lets these through. The host is
    // an element of the page: no style of the page gets through it, an inherited one included
    sheet.replaceSync(`:host{all:initial!important}${styles}`)
    shadow.adoptedStyleSheets = [sheet]

    // Faces are the document's: Chrome ignores those declared in a shadow root. Where Segoe UI is missing,
    // nothing loads and the family is passed over
    for (const [weight, ...names] of SEGOE_UI) {
      document.fonts.add(new FontFace('nano_kit Segoe UI', names.map(name => `local("${name}")`).join(), {
        weight,
        ascentOverride: '99.6%',
        descentOverride: '33.4%'
      }))
    }

    // The icons refer to the symbols of the sprite in the same tree
    shadow.innerHTML = `<div hidden>${sprite}</div>`
    document.body.append(host)

    mount(() => context$(context)(Panel()), shadow)
  })
}
