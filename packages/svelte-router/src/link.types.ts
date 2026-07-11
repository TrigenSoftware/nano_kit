import type {
  ComponentInternals,
  Snippet
} from 'svelte'
import type {
  HTMLAnchorAttributes,
  MouseEventHandler
} from 'svelte/elements'
import type { Readable } from 'svelte/store'
import type {
  Paths,
  Routes
} from '@nano_kit/router'

type AnchorAttributes = Omit<HTMLAnchorAttributes, 'children' | 'href'>

export type LinkProps<R extends Routes, K extends keyof R & string> = AnchorAttributes & {
  children?: Snippet
} & ((
  Paths<R>[K] extends infer P
    ? P extends (params?: infer Params) => string
      ? {
        /** Target route name */
        to: K
        /** Parameters for the route */
        params?: Params
        /**
         * Whether to preload the page on hover or focus.
         * Notice: Link should be created with preloadable effect.
         */
        preload?: boolean
        href?: never
      }
      : P extends (params: infer Params) => string
        ? {
          /** Target route name */
          to: K
          /** Parameters for the route */
          params: Params
          /**
           * Whether to preload the page on hover or focus.
           * Notice: Link should be created with preloadable effect.
           */
          preload?: boolean
          href?: never
        }
        : {
          /** Target route name */
          to: K
          params?: never
          /**
           * Whether to preload the page on hover or focus.
           * Notice: Link should be created with preloadable effect.
           */
          preload?: boolean
          href?: never
        }
    : never
) | {
  to?: never
  params?: never
  preload?: never
  href?: string
})

export type LinkComponent<R extends Routes> = <K extends keyof R & string>(
  internals: ComponentInternals,
  props: LinkProps<R, K>
) => object

export type LinkSettingsHook<S extends LinkSettings = LinkSettings> = (
  props: Readable<Partial<LinkProps<Routes, string>>>,
  settings: S
) => Readable<Partial<HTMLAnchorAttributes>>

export interface LinkSettings {
  onClick: MouseEventHandler<HTMLAnchorElement>
  hook: LinkSettingsHook
  addHook<S extends LinkSettings>(hook: LinkSettingsHook<S>): void
}
