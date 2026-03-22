import { isFunction } from '@nano_kit/store'

/** A plain object representing HTTP headers as key-value string pairs. */
export type AnyHeadersRecord = Record<string, string>

/** A headers object with a `get` method, compatible with the `Headers` Web API. */
export interface AnyHeadersMap {
  get(key: string): string | null
}

/** A static headers value — either a plain record or a Headers-like map. */
export type AnyStaticHeaders = AnyHeadersRecord | AnyHeadersMap

/** An async headers value — a Promise resolving to a static headers type. */
export type AnyAsyncHeaders = Promise<AnyHeadersRecord> | Promise<AnyHeadersMap>

/** Any supported headers value, static or async. */
export type AnyHeaders = AnyStaticHeaders | AnyAsyncHeaders

/**
 * Determine whether the request is a React Server Components flight request
 * by checking that the `accept` header does not include `text/html`.
 * @param headers - The request headers.
 * @returns `true` if the request is a flight request, `false` otherwise.
 */
export function isFlight(headers: AnyStaticHeaders): boolean

/**
 * Determine whether the request is a React Server Components flight request
 * by checking that the `accept` header does not include `text/html`.
 * @param headers - The request headers as a Promise.
 * @returns A Promise resolving to `true` if the request is a flight request, `false` otherwise.
 */
export function isFlight(headers: AnyAsyncHeaders): Promise<boolean>

export function isFlight(headers: AnyHeaders): boolean | Promise<boolean> {
  if (headers instanceof Promise) {
    return headers.then(isFlight)
  }

  const accept = isFunction(headers.get)
    ? (headers as AnyHeadersMap).get('accept')
    : (headers as AnyHeadersRecord).accept

  return !accept?.includes('text/html')
}
