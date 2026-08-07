import {
  type WritableSignal,
  effect
} from 'kida'
import { createEffectAttribute } from '../internals/index.js'

/**
 * Effect attribute to get element reference
 */
export const ref$ = /* @__PURE__ */ createEffectAttribute<'ref$', Element, WritableSignal<Element | null>>(
  'ref$',
  (element, $ref) => {
    $ref(element)

    effect(() => () => $ref(null))
  }
)

declare module 'nanoviews' {
  interface EffectAttributeValues {
    ref$: WritableSignal<Element | null>
  }

  interface EffectAttributeTargets {
    ref$: Element
  }
}
