import { inject } from '@nano_kit/store'
import { queryKey } from '@nano_kit/query'
import {
  type AnyTranslationData,
  intl
} from '@nano_kit/intl'
import {
  CookieStore$,
  cookieStored
} from '@nano_kit/platform-web'
import {
  type SupportedLocale,
  IntlService$,
  load,
  supportedLocales
} from '../services/intl'
import { Client$ } from './query'

export const TranslationsKey = queryKey<[locale: SupportedLocale, namespace: string], AnyTranslationData>('translations')

export function Intl$() {
  const intlService = inject(IntlService$)
  const cookieStore = inject(CookieStore$)
  const { query } = inject(Client$)
  const $locale = cookieStored(cookieStore, {
    name: 'locale',
    path: '/',
    sameSite: 'lax'
  }, intlService.getBrowserLocale())
  const {
    messages,
    $loading
  } = intl(
    $locale,
    namespace => query(TranslationsKey, [$locale, namespace], load)
  )

  return {
    supportedLocales,
    messages,
    $locale,
    $loading
  }
}
