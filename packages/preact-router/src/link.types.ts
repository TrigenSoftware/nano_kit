import type {
  AnchorHTMLAttributes,
  TargetedMouseEvent
} from 'preact'
import type {
  Routes,
  Paths
} from '@nano_kit/router'

export type LinkProps<R extends Routes, K extends keyof R & string> = AnchorHTMLAttributes & ((
  Paths<R>[K] extends infer P
    ? P extends (params?: infer Params) => string
      ? {
        /** Target route name */
        to: K
        /** Parameters for the route */
        params?: Params
        /**
         * Whether to preload the page on hover or focus.
         * Notice: Link should be created with preloadable hook.
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
           * Notice: Link should be created with preloadable hook.
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
           * Notice: Link should be created with preloadable hook.
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

export type LinkSettingsHook<S extends LinkSettings = LinkSettings> = (
  props: Partial<LinkProps<Routes, string>>,
  settings: S
) => Partial<AnchorHTMLAttributes>

export interface LinkSettings {
  onClick(event: TargetedMouseEvent<HTMLAnchorElement>): void
  addHook<S extends LinkSettings>(hook: LinkSettingsHook<S>): void
  hook?: LinkSettingsHook
}
