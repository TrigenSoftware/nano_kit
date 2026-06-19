import type {
  AnyFn,
  EmptyValue
} from '@nano_kit/store'
import type { InfinitePages } from './client.js'

/* @__NO_SIDE_EFFECTS__ */
export function addFn<
  // oxlint-disable-next-line typescript/no-explicit-any
  T extends (...args: any[]) => void
>(prevFn: T | undefined, fn: T): T {
  if (prevFn === undefined) {
    return fn
  }

  return function (this: unknown, ...args: Parameters<T>) {
    prevFn.apply(this, args)
    fn.apply(this, args)
  } as T
}

export function settle<T, R>(
  promise: Promise<T>,
  onSettled: (data: T | undefined, error?: unknown) => R
) {
  return promise.then(
    onSettled,
    error => onSettled(undefined, error)
  )
}

type ArrayItem<T> = T extends (infer I)[] ? I : never

/**
 * Append a value to an array-like cache value.
 * @param array - Previous array or empty value.
 * @param value - Value to append.
 * @returns New array with the value appended, or a single-value array when input is empty.
 */
/* @__NO_SIDE_EFFECTS__ */
export function append<A extends unknown[] | EmptyValue>(
  array: A,
  value: ArrayItem<A>
) {
  return (array ? [...(array as []), value] : [value]) as A
}

/**
 * Prepend a value to an array-like cache value.
 * @param array - Previous array or empty value.
 * @param value - Value to prepend.
 * @returns New array with the value prepended, or a single-value array when input is empty.
 */
/* @__NO_SIDE_EFFECTS__ */
export function prepend<A extends unknown[] | EmptyValue>(
  array: A,
  value: ArrayItem<A>
) {
  return (array ? [value, ...(array as [])] : [value]) as A
}

/**
 * Remove values matching the predicate from an array-like cache value.
 * @param array - Previous array or empty value.
 * @param what - Predicate that returns true for values to remove.
 * @returns Filtered array, or the empty value when input is empty.
 */
/* @__NO_SIDE_EFFECTS__ */
export function drop<A extends unknown[] | EmptyValue>(
  array: A,
  what: (value: ArrayItem<A>, index: number) => boolean
) {
  return (array ? (array as []).filter((value, index) => !what(value, index)) : array) as A
}

/**
 * Map values in an array-like cache value.
 * @param array - Previous array or empty value.
 * @param callback - Value mapper.
 * @returns Mapped array, or the empty value when input is empty.
 */
/* @__NO_SIDE_EFFECTS__ */
export function map<A extends unknown[] | EmptyValue>(
  array: A,
  callback: (value: ArrayItem<A>, index: number) => ArrayItem<A>
) {
  return (array ? (array as []).map(callback) : array) as A
}

/**
 * Sort an array-like cache value.
 * @param array - Previous array or empty value.
 * @param compare - Item comparison function.
 * @returns Sorted array copy, or the empty value when input is empty.
 */
/* @__NO_SIDE_EFFECTS__ */
export function sort<A extends unknown[] | EmptyValue>(
  array: A,
  compare: (a: ArrayItem<A>, b: ArrayItem<A>) => number
) {
  return (array ? array.toSorted(compare as AnyFn) : array) as A
}

type PagesItem<T> = T extends InfinitePages<infer P, unknown> ? P : never

/**
 * Map every page in infinite pages data.
 * @param pages - Infinite pages data or empty value.
 * @param callback - Page mapper.
 * @returns Infinite pages with mapped pages, or the empty value.
 */
/* @__NO_SIDE_EFFECTS__ */
export function mapPages<P extends InfinitePages<unknown, unknown> | EmptyValue>(
  pages: P,
  callback: (page: PagesItem<P>, index: number) => PagesItem<P>
) {
  return pages && {
    ...pages,
    pages: pages.pages.map(callback as AnyFn)
  } as P
}

/**
 * Map a page by index in infinite pages data.
 * @param pages - Infinite pages data or empty value.
 * @param index - Page index. Negative indexes count from the end.
 * @param callback - Page mapper.
 * @returns Infinite pages with the selected page mapped, or the original value.
 */
/* @__NO_SIDE_EFFECTS__ */
export function mapPageAt<P extends InfinitePages<unknown, unknown> | EmptyValue>(
  pages: P,
  index: number,
  callback: (page: PagesItem<P>) => PagesItem<P>
) {
  const firstPage = pages?.pages.at(index)

  if (!firstPage) {
    return pages
  }

  return {
    ...pages,
    pages: (pages as InfinitePages<unknown, unknown>).pages.map(
      page => (page === firstPage ? callback(page as PagesItem<P>) : page)
    )
  } as P
}

/**
 * Map the first page in infinite pages data.
 * @param pages - Infinite pages data or empty value.
 * @param callback - Page mapper.
 * @returns Infinite pages with the first page mapped, or the original value.
 */
/* @__NO_SIDE_EFFECTS__ */
export function mapFirstPage<P extends InfinitePages<unknown, unknown> | EmptyValue>(
  pages: P,
  callback: (page: PagesItem<P>) => PagesItem<P>
) {
  return mapPageAt(pages, 0, callback)
}

/**
 * Map the last page in infinite pages data.
 * @param pages - Infinite pages data or empty value.
 * @param callback - Page mapper.
 * @returns Infinite pages with the last page mapped, or the original value.
 */
/* @__NO_SIDE_EFFECTS__ */
export function mapLastPage<P extends InfinitePages<unknown, unknown> | EmptyValue>(
  pages: P,
  callback: (page: PagesItem<P>) => PagesItem<P>
) {
  return mapPageAt(pages, -1, callback)
}

/**
 * Sort items across all infinite pages while preserving page sizes.
 * The callback adapts a page shape to the item list that should be sorted.
 * It is called first to collect items, then again to write sorted items back.
 * @param pages - Infinite pages data or empty value.
 * @param compare - Item comparison function.
 * @param callback - Page adapter that receives an item-list mapper and returns an updated page.
 * @returns Infinite pages with sorted items spread back across original page chunks, or the empty value.
 */
/* @__NO_SIDE_EFFECTS__ */
export function sortPages<P extends InfinitePages<unknown, unknown> | EmptyValue, I>(
  pages: P,
  compare: (a: I, b: I) => number,
  callback: (
    sort: (items: I[]) => I[],
    page: PagesItem<P>
  ) => PagesItem<P>
) {
  if (!pages) {
    return pages
  }

  const allItems = pages.pages.flatMap((page) => {
    let items: I[]

    callback(i => items = i, page as PagesItem<P>)

    return items!
  }).sort(compare)
  let index = 0

  return {
    ...pages,
    pages: pages.pages.map(
      page => callback(
        i => i.map(() => allItems[index++]),
        page as PagesItem<P>
      )
    )
  } as P
}
