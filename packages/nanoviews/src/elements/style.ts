import {
  type CSSProperties,
  type AccessibleProps,
  type PrimitiveAttributeValue,
  setProperty,
  createEffectAttribute
} from '../internals/index.js'

export type StyleProps = AccessibleProps<CSSProperties>

function setStyle(
  element: HTMLElement | SVGAElement,
  name: string,
  $value: PrimitiveAttributeValue
) {
  setProperty(
    value => element.style.setProperty(name, value),
    () => element.style.removeProperty(name),
    $value
  )
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
