import { inject } from '@nano_kit/store'
import { queryKey } from '@nano_kit/query'
import {
  type AnyTranslationData,
  intl
} from '@nano_kit/intl'
import {
  Locales$,
  CookieStore$,
  browserLocale,
  cookieStored
} from '@nano_kit/platform-web'
import {
  type SupportedLocale,
  load,
  supportedLocales
} from '../translations'
import { Client$ } from './query'

const TranslationsKey = queryKey<[locale: SupportedLocale, namespace: string], AnyTranslationData>('translations')

export function Intl$() {
  const locales = inject(Locales$)
  const cookieStore = inject(CookieStore$)
  const { query } = inject(Client$)
  const $locale = cookieStored(cookieStore, {
    name: 'locale',
    path: '/',
    sameSite: 'lax'
  }, browserLocale(locales, supportedLocales, 'en'))
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
