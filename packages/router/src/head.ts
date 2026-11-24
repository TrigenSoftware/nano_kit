import {
  type Accessor,
  type InjectionContext,
  type AnySignalish,
  type EmptyValue,
  type ReadableSignal,
  computed,
  effect,
  inject,
  untracked,
  $get,
  get,
  subscribeAny,
  isEmptyOrFalse
} from '@nano_kit/store'
import type {
  ComposedPageRef,
  PageRef
} from './router.types.js'
import type {
  TitleValue,
  LangValue,
  DirValue,
  LinkTagProps,
  MetaTagProps,
  ScriptTagProps,
  PseudoElement,
  GenericHeadTagDescriptor,
  LinkTagDescriptor,
  ScriptTagDescriptor,
  MetaTagDescriptor,
  GenericHeadPropertyDescriptor,
  TitlePropertyDescriptor,
  LangPropertyDescriptor,
  DirPropertyDescriptor,
  GenericHeadDescriptor
} from './head.types.js'

export type * from './head.types.js'

function startProperty<T extends string>(
  this: GenericHeadPropertyDescriptor<T>,
  head: PseudoElement[],
  prevHead?: PseudoElement[] | null
) {
  const target = this.target()
  const property = this.tag
  const element = prevHead?.find(el => el.matches(property)) || {
    matches(tag) {
      return tag === property
    },
    remove() {
      target[property] = ''
    }
  }

  subscribeAny(this.value, (value) => {
    const stringValue = value || ''

    if (target[property] !== stringValue) {
      target[property] = stringValue
    }
  })

  head.push(element)
}

/**
 * Creates a head descriptor for the title element.
 * @param $value - Title value or accessor.
 * @returns Title head descriptor.
 */
/* @__NO_SIDE_EFFECTS__ */
export function title($value: TitleValue): TitlePropertyDescriptor {
  return {
    tag: 'title',
    value: $value,
    target: () => document,
    start: startProperty
  }
}

/**
 * Creates a head descriptor for the lang attribute on the html element.
 * @param $value - Language value or accessor.
 * @returns Lang head descriptor.
 */
/* @__NO_SIDE_EFFECTS__ */
export function lang($value: LangValue): LangPropertyDescriptor {
  return {
    tag: 'lang',
    value: $value,
    target: () => document.documentElement,
    start: startProperty
  }
}

/**
 * Creates a head descriptor for the dir attribute on the html element.
 * @param $value - Direction value or accessor.
 * @returns Dir head descriptor.
 */
/* @__NO_SIDE_EFFECTS__ */
export function dir($value: DirValue): DirPropertyDescriptor {
  return {
    tag: 'dir',
    value: $value,
    target: () => document.documentElement,
    start: startProperty
  }
}

/**
 * Converts a head descriptor prop name to its HTML attribute name.
 * @param prop - Prop name, such as `httpEquiv` or `crossOrigin`.
 * @returns The attribute name, such as `http-equiv` or `crossorigin`.
 */
/* @__NO_SIDE_EFFECTS__ */
export function toHtmlAttribute(prop: string) {
  return prop === 'httpEquiv' ? 'http-equiv' : prop.toLowerCase()
}

function buildPredicate(tag: string, attributes: [string, AnySignalish][]) {
  const expected: [string, string][] = []
  let code: string | undefined

  for (const [key, value] of attributes) {
    const resolvedValue = get(value) as string | boolean | EmptyValue

    // `false` leaves a boolean attribute out: the browser reads any value of it as on
    if (!isEmptyOrFalse(resolvedValue)) {
      if (key === 'code') {
        code = String(resolvedValue)
      } else {
        expected.push([toHtmlAttribute(key), String(resolvedValue)])
      }
    }
  }

  // Values are compared as they are: a selector made of them breaks on a line break or a backslash.
  // A `title`, `lang` or `dir` pseudo element has no `localName`, so it never matches
  return (
    (element: HTMLElement) => element.localName === tag
      && element.attributes.length === expected.length
      && expected.every(([name, value]) => element.getAttribute(name) === value)
      && (code === undefined || element.textContent === code)
  ) as (element: PseudoElement) => boolean
}

function queryElement(
  collection: PseudoElement[] | null | undefined,
  predicate: (element: PseudoElement) => boolean
) {
  const elements = collection || document.head.children

  for (let i = 0, len = elements.length, element; i < len; i++) {
    element = elements[i]

    if (predicate(element)) {
      return element as HTMLElement
    }
  }

  return null
}

const reactiveAttributes = /* @__PURE__ */ new Set([
  'href',
  'media',
  'disabled',
  'title',
  'content'
])

function startElement(
  this: GenericHeadTagDescriptor,
  head: PseudoElement[],
  prevHead?: PseudoElement[] | null
) {
  const attributes = Object.entries(this.props)
  const predicate = buildPredicate(this.tag, attributes)

  if (head.some(predicate)) {
    return
  }

  let element = queryElement(prevHead, predicate)
  const append = !element

  if (!element) {
    element = document.createElement(this.tag)

    for (const [key, value] of attributes) {
      if (!reactiveAttributes.has(key) && !isEmptyOrFalse(value)) {
        const stringValue = String(value)

        if (key === 'code') {
          element.textContent = stringValue
        } else {
          element.setAttribute(toHtmlAttribute(key), stringValue)
        }
      }
    }
  }

  for (const [key, $value] of attributes) {
    if (reactiveAttributes.has(key)) {
      subscribeAny($value, (value) => {
        if (isEmptyOrFalse(value)) {
          element.removeAttribute(key)
        } else {
          const stringValue = String(value)

          if (element.getAttribute(key) !== stringValue) {
            element.setAttribute(key, stringValue)
          }
        }
      })
    }
  }

  if (append) {
    document.head.appendChild(element)
  }

  head.push(element)
}

/**
 * Creates a head descriptor for a link element.
 * @param props - Link properties including href and other attributes.
 * @returns Link head descriptor.
 */
/* @__NO_SIDE_EFFECTS__ */
export function link(props: LinkTagProps): LinkTagDescriptor {
  return {
    tag: 'link',
    props,
    start: startElement
  }
}

/**
 * Creates a head descriptor for a meta element.
 * @param props - Meta properties including name, content, and other attributes.
 * @returns Meta head descriptor.
 */
/* @__NO_SIDE_EFFECTS__ */
export function meta(props: MetaTagProps): MetaTagDescriptor {
  return {
    tag: 'meta',
    props,
    start: startElement
  }
}

/**
 * Creates a head descriptor for a script element.
 * @param props - Script properties including src, code, and other attributes.
 * @returns Script head descriptor.
 */
/* @__NO_SIDE_EFFECTS__ */
export function script(props: ScriptTagProps): ScriptTagDescriptor {
  return {
    tag: 'script',
    props,
    start: startElement
  }
}

function headKey(tag: GenericHeadDescriptor) {
  const props = (tag as MetaTagDescriptor).props

  // Of the tags, only `meta` has these props.
  // The space keeps `title`, `lang` and `dir` apart from a `meta` named so
  return props
    ? props.name || props.property
    : `${tag.tag} `
}

/**
 * Joins the head of a layout with the head of what it wraps.
 * A `title`, `lang`, `dir` or `meta` of the inner head replaces the layout's ones of the same kind:
 * `meta` is told apart by its `name` or `property`. Tags repeated within one head are all kept.
 * @param outer - Head descriptors of the layout.
 * @param inner - Head descriptors of the page, or of the layouts and the page inside.
 * @returns Head descriptors of the layout that are not replaced, then the inner ones.
 */
/* @__NO_SIDE_EFFECTS__ */
export function mergeHead(
  outer: GenericHeadDescriptor[],
  inner: GenericHeadDescriptor[]
): GenericHeadDescriptor[] {
  const keys: unknown[] = inner.map(headKey)

  // A tag without a key is looked up as `0`, which no key is, so it always stays
  return [...outer.filter(tag => !keys.includes(headKey(tag) || 0)), ...inner]
}

function getHeadDescriptors(
  page: ComposedPageRef<unknown> | null | undefined,
  context: InjectionContext | undefined
): GenericHeadDescriptor[] {
  return page
    ? mergeHead(
      page.Head$
        ? context
          ? inject(page.Head$, context)
          : page.Head$()
        : [],
      getHeadDescriptors(page.r, context)
    )
    : []
}

/**
 * Synchronizes the head of the document with the head descriptors provided by the current page.
 * @param $page - Accessor for the current page reference.
 * @param context - Optional injection context to resolve head factories.
 * @returns Effect cleanup function to stop synchronization.
 */
export function syncHead(
  $page: Accessor<PageRef<unknown> | null>,
  context?: InjectionContext
) {
  let current: PseudoElement[] | null = null

  return effect(() => {
    const page = $page()
    const tags = untracked(() => getHeadDescriptors(page, context))
    const next: PseudoElement[] = []

    for (const tag of tags) {
      tag.start(next, current)
    }

    if (current) {
      for (const element of current) {
        if (!next.includes(element)) {
          element.remove()
        }
      }
    }

    current = next
  })
}

/**
 * Creates a signal of the current page title: the value of the first title descriptor in the head of the page, its own before its layouts'.
 * @param $page - Accessor for the current page reference.
 * @param context - Optional injection context to resolve head factories.
 * @returns Signal of the title, or of an empty string while the head has none.
 */
/* @__NO_SIDE_EFFECTS__ */
export function pageTitle(
  $page: Accessor<PageRef<unknown> | null>,
  context?: InjectionContext
): ReadableSignal<string> {
  return computed(() => {
    const page = $page()
    const descriptor = untracked(() => getHeadDescriptors(page, context))
      .find((tag): tag is TitlePropertyDescriptor => tag.tag === 'title')

    return (descriptor && $get(descriptor.value)) || ''
  })
}
