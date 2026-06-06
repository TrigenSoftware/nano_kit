import type {
  ElementName,
  PickElementType,
  Attributes,
  Children,
  VoidElementFactory,
  LazyElement,
  ElementFactory,
  EmptyValue
} from '../types/index.js'
import { isEmpty } from '../utils.js'
import {
  childToNode,
  lazyChild
} from './child.js'
import { setAttributes } from './attributes.js'

/**
 * Create [void HTML element](https://developer.mozilla.org/en-US/docs/Glossary/Void_element)
 * @param tag - Tag name
 * @param attributes - Element attributes
 * @returns Void element
 */
export function createVoidElement<Tag extends ElementName>(
  tag: Tag,
  attributes?: Attributes<Tag>
) {
  // @todo: remove `as` when full SVG support will be added
  const element = document.createElement(tag) as PickElementType<Tag>

  if (attributes !== undefined) {
    setAttributes(element, attributes)
  }

  return element
}

/**
 * Create [void HTML element](https://developer.mozilla.org/en-US/docs/Glossary/Void_element) factory
 * @param tag - Tag name
 * @returns Function to create given void element
 */
/* @__NO_SIDE_EFFECTS__ */
export function createVoidElementFactory<Tag extends ElementName>(
  tag: Tag
) {
  // oxlint-disable-next-line typescript/no-unnecessary-type-assertion
  return createVoidElement.bind(null, tag as ElementName) as VoidElementFactory<Tag>
}

export function elementChildren(
  this: Element | ShadowRoot | DocumentFragment,
  result: Element | DocumentFragment,
  ...children: Children
) {
  const len = children.length

  if (len) {
    for (let i = 0, node: ChildNode | DocumentFragment | EmptyValue; i < len; i++) {
      if (!isEmpty(node = childToNode(children[i]))) {
        this.appendChild(node)
      }
    }
  }

  return result
}

/**
 * Create HTML element
 * @param tag - Tag name
 * @param attributes - Element attributes
 * @returns Function to pass children
 */
export function createElement<Tag extends ElementName>(
  tag: Tag,
  attributes?: Attributes<Tag>
) {
  const element = createVoidElement(tag, attributes)

  return lazyChild(elementChildren.bind(element, element)) as LazyElement<Tag>
}

/**
 * Create HTML element factory
 * @param tag - Tag name
 * @returns Function to create given element
 */
/* @__NO_SIDE_EFFECTS__ */
export function createElementFactory<Tag extends ElementName>(
  tag: Tag
) {
  // oxlint-disable-next-line typescript/no-unnecessary-type-assertion
  return createElement.bind(null, tag as ElementName) as ElementFactory<Tag>
}
