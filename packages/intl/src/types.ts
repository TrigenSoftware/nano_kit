import type {
  Accessor,
  AnyFn,
  EmptyValue,
  ReadableSignal,
  ResolvedLike
} from '@nano_kit/store'
import type {
  AnyFormat,
  Format
} from './format/types.js'

export type { AnyFormat }

export type AnyNamespaceTranslationData = Record<string, any>

export type AnyTranslationData = Record<string, AnyNamespaceTranslationData>

export type TranslationData<T extends AnyTranslationData> = {
  [K in keyof T]: AnyNamespaceTranslationData
}

export type NamespaceLoader<T extends TranslationData<T>> = <K extends keyof T>(namespace: K, schemeEntries: [string, AnyFormat][]) => ResolvedLike<T[K] | EmptyValue>

export type Loader<T extends TranslationData<T>> = ResolvedLike<T | EmptyValue> | NamespaceLoader<T>

export type MessagesScheme<T extends AnyNamespaceTranslationData> = Record<string, AnyFormat> & {
  [K in keyof T]?: Format<Exclude<T[K], undefined>, unknown>
}

export type Messages<
  T extends AnyNamespaceTranslationData,
  S extends Record<string, AnyFormat> = Record<never, never>
> = Partial<Omit<T, keyof S>> & {
  [K in keyof S]: ReturnType<S[K]>
}

type MessageKeys<
  T extends AnyNamespaceTranslationData,
  S extends Record<string, AnyFormat>
> = string extends keyof T
  ? keyof S & string
  : keyof Messages<T, S> & string

export type MessageSignals<
  T extends AnyNamespaceTranslationData,
  S extends Record<string, AnyFormat>
> = {
  [K in MessageKeys<T, S> as `$${K}`]: ReadableSignal<Messages<T, S>[K]>
}

type MessageFunction<T> = T extends (...args: infer P) => infer R
  ? (...args: P) => ReadableSignal<R>
  : never

export type MessageFunctions<
  T extends AnyNamespaceTranslationData,
  S extends Record<string, AnyFormat>
> = {
  [K in MessageKeys<T, S> as Messages<T, S>[K] extends AnyFn ? K : never]: MessageFunction<Messages<T, S>[K]>
}

export type MessagesAccessor<
  T extends AnyNamespaceTranslationData,
  S extends Record<string, AnyFormat>
> = ReadableSignal<Messages<T, S>>
  & MessageSignals<T, S>
  & MessageFunctions<T, S>

export type UnionToIntersection<U> = (
  U extends unknown ? (value: U) => void : never
) extends (value: infer I) => void ? I : never

export interface FormatContext {
  $locale: Accessor<string>
}
