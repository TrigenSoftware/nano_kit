import type { Accessor } from '@nano_kit/store'
import type {
  Bound,
  AnyTranslationData,
  Loader,
  TranslationData
} from './types.js'
import { IntlContext } from './context.js'

/**
 * Creates an internationalization context with bound helpers.
 * @param $locale - Active locale accessor.
 * @param loader - Messages loader bound to the active locale.
 * @returns Internationalization context with `messages` safe to destructure.
 */
export function intl<
  L extends string,
  T extends TranslationData<T> = AnyTranslationData
>(
  $locale: Accessor<L>,
  loader: Loader<T>
): Bound<IntlContext<L, T>, 'messages'> {
  const ctx = new IntlContext($locale, loader)

  ctx.messages = ctx.messages.bind(ctx)

  return ctx
}
