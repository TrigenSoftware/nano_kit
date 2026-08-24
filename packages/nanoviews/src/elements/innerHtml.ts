
import {
  type Signalish,
  isAccessor,
  effect
} from 'kida'

/**
 * Dangerously set inner HTML to element
 * @param factory - Element factory
 * @param $html - HTML string or store with it
 * @returns Target element
 */
export function dangerouslySetInnerHtml<T extends Element>(
  factory: () => T,
  $html: Signalish<string>
) {
  const element = factory()

  if (isAccessor($html)) {
    effect(() => {
      element.innerHTML = $html()
    }, true)
  } else {
    element.innerHTML = $html
  }

  return element
}
