import type {
  ValueOrAccessor,
  EmptyValue,
  AnyValueOrAccessor
} from '@nano_kit/store'

export type LinkRel =
  | 'alternate'
  | 'author'
  | 'canonical'
  | 'dns-prefetch'
  | 'external'
  | 'help'
  | 'icon'
  | 'license'
  | 'manifest'
  | 'modulepreload'
  | 'next'
  | 'nofollow'
  | 'noopener'
  | 'noreferrer'
  | 'opener'
  | 'pingback'
  | 'preconnect'
  | 'prefetch'
  | 'preload'
  | 'prev'
  | 'search'
  | 'stylesheet'
  | 'tag'
  | string & {}

export type LinkAs =
  | 'audio'
  | 'document'
  | 'embed'
  | 'fetch'
  | 'font'
  | 'image'
  | 'object'
  | 'script'
  | 'style'
  | 'track'
  | 'video'
  | 'worker'

export type CrossOrigin = 'anonymous' | 'use-credentials'

export type ReferrerPolicy =
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url'

export type FetchPriority = 'high' | 'low' | 'auto'

export interface LinkTagProps {
  href?: ValueOrAccessor<string | EmptyValue>
  media?: ValueOrAccessor<string | EmptyValue>
  disabled?: ValueOrAccessor<boolean | EmptyValue>
  title?: ValueOrAccessor<string | EmptyValue>
  rel?: LinkRel | EmptyValue
  as?: LinkAs | EmptyValue
  type?: string | EmptyValue
  hrefLang?: string | EmptyValue
  sizes?: string | EmptyValue
  imageSrcSet?: string | EmptyValue
  imageSizes?: string | EmptyValue
  crossOrigin?: CrossOrigin | EmptyValue
  referrerPolicy?: ReferrerPolicy | EmptyValue
  integrity?: string | EmptyValue
  blocking?: 'render' | EmptyValue
  fetchPriority?: FetchPriority | EmptyValue
}

export type ScriptType =
  | 'module'
  | 'importmap'
  | 'application/json'
  | 'text/javascript'
  | 'application/ld+json'
  | (string & {})

export interface ScriptTagProps {
  src?: string | EmptyValue
  type?: ScriptType | EmptyValue
  async?: boolean | EmptyValue
  defer?: boolean | EmptyValue
  noModule?: boolean | EmptyValue
  crossOrigin?: CrossOrigin | EmptyValue
  integrity?: string | EmptyValue
  referrerPolicy?: ReferrerPolicy | EmptyValue
  fetchPriority?: FetchPriority | EmptyValue
  code?: string | EmptyValue
}

export interface MetaTagProps {
  content?: ValueOrAccessor<string | EmptyValue>
  media?: ValueOrAccessor<string | EmptyValue>
  charSet?: string | EmptyValue
  name?: string | EmptyValue
  httpEquiv?: string | EmptyValue
  property?: string | EmptyValue
  scheme?: string | EmptyValue
}

export type LangValue = ValueOrAccessor<string | EmptyValue>

export type Dir = 'ltr' | 'rtl' | 'auto'

export type DirValue = ValueOrAccessor<Dir | EmptyValue>

export type TitleValue = ValueOrAccessor<string | EmptyValue>

export interface PseudoElement {
  matches(selector: string): boolean
  remove(): void
}

export interface GenericHeadTagDescriptor {
  tag: string
  props: Record<string, AnyValueOrAccessor>
  start(head?: PseudoElement[] | null): PseudoElement
}

export interface LinkTagDescriptor extends GenericHeadTagDescriptor {
  tag: 'link'
  props: LinkTagProps
}

export interface ScriptTagDescriptor extends GenericHeadTagDescriptor {
  tag: 'script'
  props: ScriptTagProps
}

export interface MetaTagDescriptor extends GenericHeadTagDescriptor {
  tag: 'meta'
  props: MetaTagProps
}

export type HeadTagDescriptor = LinkTagDescriptor | ScriptTagDescriptor | MetaTagDescriptor

export interface GenericHeadPropertyDescriptor<T extends string = string> {
  tag: T
  value: ValueOrAccessor<string | EmptyValue>
  target(): Record<T, string>
  start(head?: PseudoElement[] | null): PseudoElement
}

export interface TitlePropertyDescriptor extends GenericHeadPropertyDescriptor<'title'> {
  target(): Document
}

export interface LangPropertyDescriptor extends GenericHeadPropertyDescriptor<'lang'> {
  target(): HTMLElement
}

export interface DirPropertyDescriptor extends GenericHeadPropertyDescriptor<'dir'> {
  target(): HTMLElement
}

export type HeadPropertyDescriptor = TitlePropertyDescriptor | LangPropertyDescriptor | DirPropertyDescriptor

export type GenericHeadDescriptor = HeadTagDescriptor | HeadPropertyDescriptor

export type HeadDescriptor = HeadTagDescriptor | HeadPropertyDescriptor
