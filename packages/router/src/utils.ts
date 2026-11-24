import type {
  UrlUpdate,
  UrlObject,
  UrlHrefObject,
  HistoryAction,
  Location
} from './types.js'

/**
 * Removes trailing slash from a path string.
 * @param path - The path string to process.
 * @returns The path string without a trailing slash.
 */
/* @__NO_SIDE_EFFECTS__ */
export function removeTrailingSlash(path: string) {
  return path.replace(/(.)\/($|\?)/, '$1$2')
}

/**
 * Parses a href string into a URL object.
 * @param href - The href string to parse.
 * @returns URL object representing the parsed href.
 */
/* @__NO_SIDE_EFFECTS__ */
export function parseHref(href: string) {
  return new URL(removeTrailingSlash(href), 'http://a')
}

/**
 * Parses the initial href of a navigation, such as the URL of a request, into a URL object.
 * The path comes out as the browser keeps it in `location.pathname`: it is read after a host of its own,
 * so `//x` or `///` stays a path and never fails, and it keeps its trailing slash.
 * A full URL is parsed as it is, and a broken one ends up in a path that no route has.
 * @param href - The href string to parse.
 * @returns URL object representing the parsed href.
 */
/* @__NO_SIDE_EFFECTS__ */
export function parseInitialHref(href: string) {
  try {
    return new URL(href.startsWith('/') ? `http://a${href}` : href, 'http://a')
  } catch {
    return new URL(`http://a${href}`)
  }
}

/**
 * Generates a href string from a URL object.
 * @param location - The URL object containing pathname, search, and hash.
 * @returns The generated href string.
 */
/* @__NO_SIDE_EFFECTS__ */
export function getHref(location: UrlObject): string {
  return removeTrailingSlash(location.pathname + location.search + location.hash)
}

/**
 * Creates an URL object with href from a UrlObject.
 * @param url - The UrlObject containing pathname, search, and hash.
 * @returns UrlHrefObject with generated href.
 */
/* @__NO_SIDE_EFFECTS__ */
export function createHrefObject(url: UrlObject): UrlHrefObject {
  return {
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    href: getHref(url)
  }
}

/**
 * Applies navigation updates to an UrlObject.
 * @param url - The original UrlObject to update.
 * @param update - Navigation update string or UrlUpdate object with partial URL components.
 * @returns Updated UrlHrefObject.
 */
/* @__NO_SIDE_EFFECTS__ */
export function updateHrefObject(
  url: UrlObject,
  update: string | UrlUpdate
): UrlHrefObject {
  const updateObject = typeof update === 'string'
    ? parseHref(update)
    : update
  const updatedUrl = parseHref(updateObject.pathname ?? url.pathname)

  updatedUrl.search = updateObject.search ?? url.search
  updatedUrl.hash = updateObject.hash ?? url.hash

  if (updateObject.searchParams) {
    updatedUrl.search = updateObject.searchParams.toString()
  }

  return createHrefObject(updatedUrl)
}

/**
 * Updates a href string with navigation changes.
 * @param href - The original href string to update.
 * @param update - Navigation update string or UrlUpdate object with partial URL components.
 * @returns Updated href string.
 */
export function updateHref(href: string, update: string | UrlUpdate): string {
  if (typeof update === 'string') {
    return removeTrailingSlash(update)
  }

  return updateHrefObject(parseHref(href), update).href
}

/**
 * Composes multiple matcher functions into a single matcher.
 * @param matchers - Array of matcher functions to compose.
 * @param nomatch - Value to return if no match is found (default: null).
 * @returns Composed matcher function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function composeMatchers<A extends unknown[], R = unknown, N = null>(
  matchers: ((...args: [...A]) => R | N)[],
  nomatch: N = null as N
) {
  const len = matchers.length

  return (...args: A) => {
    for (let i = 0, result; i < len; i++) {
      if (result = matchers[i](...args)) {
        return result
      }
    }

    return nomatch
  }
}

/**
 * Creates a location object with action for navigation.
 * @param url - The UrlObject representing the location.
 * @param action - The history action associated with the location (default: null).
 * @returns Location object with URL and action.
 */
/* @__NO_SIDE_EFFECTS__ */
export function createLocation(
  url: UrlObject,
  action: HistoryAction = null
): Location {
  return {
    ...createHrefObject(url),
    action
  }
}

/**
 * Updates a location object with navigation changes.
 * @param url - The original UrlObject to update.
 * @param update - Navigation update string or UrlUpdate object with partial URL components.
 * @param action - The history action associated with the updated location.
 * @returns Updated Location object.
 */
/* @__NO_SIDE_EFFECTS__ */
export function updateLocation(
  url: UrlObject,
  update: string | UrlUpdate,
  action: HistoryAction
): Location {
  return {
    ...updateHrefObject(url, update),
    action
  }
}
