import {
  isAccessor,
  effect
} from 'kida'
import {
  type CSSProperties,
  type AccessibleProps,
  type PrimitiveAttributeValue,
  type Primitive,
  createEffectAttribute
} from '../internals/index.js'

export type StyleProps = AccessibleProps<CSSProperties>

// Every camelCased CSS property is a real writable property of
// `CSSStyleDeclaration`, but it declares no string index signature
type StyleDeclaration = CSSStyleDeclaration & Record<string, string>

// `CSSProperties` is camelCased, while `setProperty` matches its argument
// against the hyphenated CSS property names only and silently drops
// everything else, so the assignment is the writer that accepts the names this
// attribute is typed with - except for custom properties, which the assignment
// does not see at all. An empty value removes the property either way, so
// there is nothing to branch on
function setStyleValue(
  style: StyleDeclaration,
  name: string,
  value: Primitive
) {
  const cssValue = value as string ?? ''

  if (name.startsWith('--')) {
    style.setProperty(name, cssValue)
  } else {
    style[name] = cssValue
  }
}

function setStyle(
  element: HTMLElement | SVGAElement,
  name: string,
  $value: PrimitiveAttributeValue
) {
  const style = element.style as StyleDeclaration

  if (isAccessor($value)) {
    effect(() => {
      setStyleValue(style, name, $value())
    }, true)
  } else {
    setStyleValue(style, name, $value)
  }
}

/**
 * Effect attribute to set style properties on element
 */
export const style$ = /* @__PURE__ */ createEffectAttribute<'style$', HTMLElement | SVGAElement, StyleProps>(
  'style$',
  (element, style) => {
    const keys = Object.keys(style)
    const len = keys.length

    if (len) {
      for (let i = 0, key: keyof StyleProps; i < len; i++) {
        key = keys[i] as keyof StyleProps

        setStyle(element, key, style[key])
      }
    }
  }
)

declare module 'nanoviews' {
  interface EffectAttributeValues {
    style$: StyleProps
  }

  interface EffectAttributeTargets {
    style$: HTMLElement | SVGAElement
  }
}
