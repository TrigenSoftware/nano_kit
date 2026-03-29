'use client'
import NextLink, { type LinkProps as NextLinkProps } from 'next/link.js'
import type {
  AnchorHTMLAttributes,
  ReactNode,
  RefAttributes
} from 'react'
import type {
  AppRoutes,
  Routes,
  Paths
} from '@nano_kit/router'
import { usePaths } from '@nano_kit/react-router'

type NextLinkBaseProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof NextLinkProps<unknown>
> & Omit<NextLinkProps<unknown>, 'href'> & {
  children?: ReactNode | undefined
} & RefAttributes<HTMLAnchorElement>

export type LinkProps<R extends Routes, K extends keyof R & string> = NextLinkBaseProps & ((
  Paths<R>[K] extends infer P
    ? P extends (params?: infer Params) => string
      ? {
        /** Target route name */
        to: K
        /** Parameters for the route */
        params?: Params
        href?: never
      }
      : P extends (params: infer Params) => string
        ? {
          /** Target route name */
          to: K
          /** Parameters for the route */
          params: Params
          href?: never
        }
        : {
          /** Target route name */
          to: K
          params?: never
          href?: never
        }
    : never
) | {
  to?: never
  params?: never
  href?: NextLinkProps<unknown>['href']
})

/**
 * Next.js Link component with router-aware `to` and `params` props.
 * Should be used inside injection context with navigation and paths provided.
 */
export function Link<K extends keyof AppRoutes>(props: LinkProps<AppRoutes, K>) {
  const {
    to,
    href: hrefProp,
    params,
    ...restProps
  } = props
  const paths = usePaths()
  const path = (to && paths[to]) as string | ((params: unknown) => string) | undefined
  const href = hrefProp ?? (path && (
    typeof path === 'function'
      ? path(params)
      : path
  ))

  return (
    // @ts-expect-error - ¯\＿(ツ)＿/¯
    <NextLink
      href={href}
      {...restProps}
    />
  )
}
