import { inject } from '@nano_kit/store'
import { queryKey } from '@nano_kit/query'
import { intl } from '@nano_kit/intl'
import {
  Locales$,
  CookieStore$,
  browserLocale,
  cookieStored
} from '@nano_kit/platform-web'
import {
  type SupportedLocale,
  type Translations,
  load,
  supportedLocales
} from '../translations'
import { Client$ } from './query'

const TranslationsKey = queryKey<[locale: SupportedLocale], Translations>('translations')

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
    query(TranslationsKey, [$locale], load)
  )

  return {
    supportedLocales,
    messages,
    $locale,
    $loading
  }
}
