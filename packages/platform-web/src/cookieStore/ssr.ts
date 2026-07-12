/**
 * Serializes the specified cookies from a cookie store into a `Cookie` request header value.
 * @param cookieStore - The cookie store to read cookies from.
 * @param cookies - Names of the cookies to serialize.
 * @returns Serialized `Cookie` header value.
 */
export async function serializeCookies(cookieStore: CookieStore, cookies: string[]) {
  const entries = await Promise.all(
    cookies.map(cookie => cookieStore.get(cookie))
  )

  return entries.reduce((header, entry) => {
    if (entry?.name !== undefined && entry.value !== undefined) {
      return `${header}${header ? '; ' : ''}${entry.name}=${entry.value}`
    }

    return header
  }, '')
}
