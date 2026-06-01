/**
 * Dependency injection token for a `CookieStore` implementation.
 * @returns The current `CookieStore` instance from the injector.
 */
export function CookieStore$(): CookieStore {
  return cookieStore
}
