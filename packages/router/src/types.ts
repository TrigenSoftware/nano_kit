import type { ReadableSignal } from '@nano_kit/store'

export interface UrlObject {
  hash: string
  pathname: string
  search: string
}

export interface UrlHrefObject extends UrlObject {
  href: string
}

export interface UrlUpdate {
  hash?: string
  pathname?: string
  search?: string
  searchParams?: URLSearchParams
}

export type HistoryAction = 'push' | 'replace' | 'pop' | 'permanent-replace' | null

export interface Location extends UrlHrefObject {
  action: HistoryAction
}

export type LocationSignal = ReadableSignal<Location>

export type Routes = Record<string, string>

type Split<S extends string, D extends string> = string extends S
  ? string[]
  : S extends ''
    ? []
    : S extends `${infer T}${D}${infer U}`
      ? [T, ...Split<U, D>]
      : [S]

type PathToParams<PathArray, Value = string, Params = {}> = PathArray extends [
  infer First,
  ...infer Rest
]
  ? First extends `:${infer Param}`
    ? First extends `:${infer Param}?`
      ? PathToParams<Rest, Value, Params & Partial<Record<Param, Value>>>
      : PathToParams<Rest, Value, Params & Record<Param, Value>>
    : Rest extends []
      ? First extends '*'
        ? Params & { splat: Value }
        : PathToParams<Rest, Value, Params>
      : PathToParams<Rest, Value, Params>
  : Params

type Simplify<T> = {
  [K in keyof T]: T[K]
} & {}

export type ParseUrl<Path extends string, Value = string> = Simplify<PathToParams<Split<Path, '/'>, Value>>
