import type { AnyFn } from '@nano_kit/store'
import type { Routes } from './types.js'
import type { Paths } from './paths.types.js'
import { removeTrailingSlash } from './utils.js'

export * from './paths.types.js'

function execPattern(
  this: (string | ((params: Record<string, string | number>) => string))[],
  params: Record<string, string | number>
) {
  return this
    .map((part, i) => (i % 2 === 0 ? part as string : (part as (params: Record<string, string | number>) => string)(params)))
    .join('')
}

function partToFunction(part: string, i: number) {
  return (
    i % 2 === 0
      ? part
      : part === undefined
        ? (params: Record<string, string | number> = {}) => (
          params.splat
            ? `/${params.splat}`
            : ''
        )
        : (params: Record<string, string | number> = {}) => (
          part in params
            ? `/${encodeURIComponent(params[part])}`
            : ''
        )
  )
}

function patternToFunction(pattern: string) {
  const parts = pattern
    .split(/\/(?::(\w+)\??|\*)/g)
    .map(partToFunction)

  return execPattern.bind(parts)
}

/**
 * Builds path generators from route definitions.
 * Creates functions or static strings for generating URLs from route patterns.
 * @param routes - Object mapping route names to URL patterns
 * @returns Object with path generators for each route
 */
/* @__NO_SIDE_EFFECTS__ */
export function buildPaths<const R extends Routes>(routes: R) {
  return Object.entries(routes).reduce<Record<string, string | AnyFn>>(
    (hrefs, [route, pattern]) => {
      if (/:|\*/.test(pattern)) {
        hrefs[route] = patternToFunction(pattern)
      } else {
        hrefs[route] = removeTrailingSlash(pattern)
      }

      return hrefs
    },
    {}
  ) as Paths<R>
}

/**
 * Adds a base path to all route patterns.
 * @param base - The base path to prepend.
 * @param routes - The original route patterns.
 * @returns New route patterns with the base path prepended.
 */
/* @__NO_SIDE_EFFECTS__ */
export function basePath<const R extends Routes>(base: string | null | undefined, routes: R): R {
  if (!base) {
    return routes
  }

  const normalizedBase = removeTrailingSlash(base).replace(/^\.\//, '/')

  if (normalizedBase === '' || normalizedBase === '/') {
    return routes
  }

  return Object.entries(routes).reduce<Record<string, string>>(
    (paths, [route, pattern]) => {
      paths[route] = removeTrailingSlash(`${normalizedBase}${pattern}`)

      return paths
    },
    {}
  ) as R
}
