/* oxlint-disable typescript/no-redundant-type-constituents */
import {
  type Signalish,
  $get,
  effect
} from 'kida'
import {
  type FalsyValue,
  createEffectAttribute
} from '../internals/index.js'

export type ClassList = Signalish<string | boolean | FalsyValue>[]

function cx(parts: unknown[]) {
  const len = parts.length
  let cls = ''

  if (len) {
    for (let i = 0, part: unknown; i < len; i++) {
      if ((part = parts[i]) && typeof part === 'string') {
        cls += (cls && ' ') + part
      }
    }
  }

  return cls
}

/**
 * Effect attribute to set class list on element
 */
export const classList$ = /* @__PURE__ */ createEffectAttribute<'classList$', HTMLElement, ClassList>(
  'classList$',
  (element, parts) => {
    effect(() => {
      element.className = cx(parts.map($get))
    }, true)
  }
)

declare module 'nanoviews' {
  interface EffectAttributeValues<Target extends Element> {
    classList$: ClassList
  }

  interface EffectAttributeTargets {
    classList$: HTMLElement
  }
}
