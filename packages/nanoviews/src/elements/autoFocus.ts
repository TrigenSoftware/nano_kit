import {
  type ValueOrAccessor,
  isAccessor,
  effect
} from 'kida'
import { createEffectAttribute } from '../internals/index.js'

/**
 * Effect attribute to set auto focus on element
 */
export const autoFocus$ = /* @__PURE__ */ createEffectAttribute<'autoFocus$', HTMLElement | SVGElement, ValueOrAccessor<boolean>>(
  'autoFocus$',
  (element, $value) => {
    if (isAccessor($value) && $value() || $value) {
      effect(() => {
        element.focus()
      })
    }
  }
)

declare module 'nanoviews' {
  interface EffectAttributeValues {
    autoFocus$: ValueOrAccessor<boolean>
  }

  interface EffectAttributeTargets {
    autoFocus$: HTMLElement | SVGElement
  }
}
