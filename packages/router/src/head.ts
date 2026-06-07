import {
  type Accessor,
  type InjectionContext,
  type AnyValueOrAccessor,
  type EmptyValue,
  effect,
  inject,
  untracked,
  get,
  subscribeAny,
  isEmpty
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
  const predicate = (el: PseudoElement) => el.matches(property)

  if (head.some(predicate)) {
    return
  }

  const element = prevHead?.find(predicate) || {
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

function buildPredicate(tag: string, attributes: [string, AnyValueOrAccessor][]) {
  let selector = tag
  let count = 0
  let code: string | undefined

  for (const [key, value] of attributes) {
    const resolvedValue = get(value) as string | boolean | EmptyValue

    if (!isEmpty(resolvedValue)) {
      if (key === 'code') {
        code = String(resolvedValue)
      } else {
        count++
        selector += `[${key}="${String(resolvedValue).replace(/"/g, '\\"')}"]`
      }
    }
  }

  return (
    (element: HTMLElement) => element.matches(selector)
      && element.attributes.length === count
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
      if (!reactiveAttributes.has(key) && !isEmpty(value)) {
        const stringValue = String(value)

        if (key === 'code') {
          element.textContent = stringValue
        } else {
          element.setAttribute(key, stringValue)
        }
      }
    }
  }

  for (const [key, $value] of attributes) {
    if (reactiveAttributes.has(key)) {
      subscribeAny($value, (value) => {
        if (isEmpty(value)) {
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

function getHeadDescriptors(
  page: ComposedPageRef<unknown> | null | undefined,
  context: InjectionContext | undefined
): GenericHeadDescriptor[] {
  return page
    ? [
      ...getHeadDescriptors(page.r, context),
      ...page.Head$
        ? context
          ? inject(page.Head$, context)
          : page.Head$()
        : []
    ]
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
