import {
  type InjectionContext,
  inject
} from '@nano_kit/store'
import { Location$ } from '@nano_kit/router'

/**
 * Helper function to create a redirect object for Next.js Pages Router.
 * @param context - Injection context to access the current location.
 * @param permanent - Whether the redirect is permanent (HTTP 301) or temporary (HTTP 302).
 * @returns Redirect object or null if no redirect is needed.
 */
export function redirect(
  context: InjectionContext,
  permanent = false
) {
  const $location = inject(Location$, context)
  const location = $location()

  if (location.action) {
    return {
      redirect: {
        destination: location.href,
        permanent
      }
    }
  }

  return null
}

/**
 * Helper function to create a notFound object for Next.js Pages Router.
 * @param found - Condition indicating whether the requested resource was found.
 * @returns notFound object if the resource was not found, otherwise null.
 */
export function notFound(found: unknown) {
  if (!found) {
    return {
      notFound: true
    }
  }

  return null
}
