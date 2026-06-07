/* oxlint-disable typescript/no-redundant-type-constituents */
import {
  type ValueOrAccessor,
  $get,
  subscribe
} from 'kida'
import {
  type FalsyValue,
  createEffectAttribute
} from '../internals/index.js'

export type ClassList = ValueOrAccessor<string | boolean | FalsyValue>[]

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
export const $$classList = /* @__PURE__ */ createEffectAttribute<'$$classList', HTMLElement, ClassList>(
  '$$classList',
  (element, parts) => {
    subscribe(
      () => cx(parts.map($get)),
      className => element.className = className,
      true
    )
  }
)

declare module 'nanoviews' {
  interface EffectAttributeValues {
    $$classList: ClassList
  }

  interface EffectAttributeTargets {
    $$classList: HTMLElement
  }
}
