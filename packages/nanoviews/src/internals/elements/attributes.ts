import {
  isAccessor,
  isFunction,
  effect,
  untracked
} from 'kida'
import type {
  PrimitiveAttributeValue,
  TargetEventHandler
} from '../types/index.js'
import { isEmpty } from '../utils.js'
import { effectAttributes } from './effectAttribute.js'

type AttributeValue = PrimitiveAttributeValue | TargetEventHandler

type Attributes = Record<string, AttributeValue>

function setAttribute(element: Element, name: string, $value: PrimitiveAttributeValue) {
  // A static attribute is the common case: apply it without building the
  // setter closures a reactive binding needs
  if (isAccessor($value)) {
    effect(() => {
      const value = $value()

      if (isEmpty(value)) {
        element.removeAttribute(name)
      } else {
        element.setAttribute(name, value as string)
      }
    }, true)
  } else if (!isEmpty($value)) {
    element.setAttribute(name, $value as string)
  }
}

function isEventHandler(key: string, value: unknown): value is TargetEventHandler {
  return key.startsWith('on') && isFunction(value)
}

// Building the event name allocates a string the browser has to atomize on
// every `addEventListener`; keyed by the prop name, the same string object is
// handed over every time
const eventNames: Record<string, string> = {}

function setEventListener(element: Element, name: string, value: TargetEventHandler) {
  // `onGotPointerCapture` and `onLostPointerCapture` end with `Capture`
  // themselves, and are ordinary bubbling events
  const capture = name.endsWith('Capture') && !name.endsWith('PointerCapture')

  element.addEventListener(
    eventNames[name] ??= name.slice(2, capture ? -7 : undefined).toLowerCase(),
    // A handler is user code: it must not subscribe whatever effect happens to
    // be running when the event is dispatched synchronously from inside one -
    // `autoFocus$` calls `focus()` from an effect, and that is not exotic
    event => untracked(() => (value as EventListener).call(element, event)),
    capture
  )
}

/**
 * Set reactive attributes to element
 * @todo Maybe we can implement validation for dev build
 *       https://github.com/facebook/react/blob/2f8f7760223241665f472a2a9be16650473bce39/packages/react-dom-bindings/src/shared/ReactDOMUnknownPropertyHook.js
 *       https://github.com/facebook/react/blob/2f8f7760223241665f472a2a9be16650473bce39/packages/react-dom-bindings/src/client/ReactDOMComponent.js
 * @param element - Target element
 * @param attributes - Target attributes
 */
export function setAttributes<A extends object>(element: Element, attributes: A) {
  for (const key in attributes) {
    const value = (attributes as Attributes)[key]
    const tEffectAttr = effectAttributes.get(key)

    if (tEffectAttr !== undefined) {
      tEffectAttr(element, value, attributes as Attributes)
    } else if (isEventHandler(key, value)) {
      setEventListener(element, key, value)
    } else {
      setAttribute(element, key, value)
    }
  }
}
