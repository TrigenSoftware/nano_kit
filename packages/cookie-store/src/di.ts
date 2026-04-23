/**
 * Dependency injection token for a `CookieStore` implementation.
 * @returns The current `CookieStore` instance from the injection context.
 */
export function CookieStore$(): CookieStore | null {
  return cookieStore
}
