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
  interface EffectAttributeValues<Target extends Element> {
    // A signal is invariant, so every type a ref may be declared with has to
    // be named: the element itself, the two branches of the tree it belongs
    // to, and their root
    ref$: WritableSignal<Target | null>
      | WritableSignal<HTMLElement | null>
      | WritableSignal<SVGElement | null>
      | WritableSignal<Element | null>
  }

  interface EffectAttributeTargets {
    ref$: Element
  }
}
