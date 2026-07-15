import { inject } from '@nano_kit/store'
import { queryKey } from '@nano_kit/query'
import { intl } from '@nano_kit/intl'
import {
  CookieStore$,
  cookieStored
} from '@nano_kit/platform-web'
import {
  type SupportedLocale,
  type Translations,
  IntlService$,
  load,
  supportedLocales
} from '../services/intl'
import { Client$ } from './query'

export const TranslationsKey = queryKey<[locale: SupportedLocale], Translations>('translations')

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
    query(TranslationsKey, [$locale], load)
  )

  return {
    supportedLocales,
    messages,
    $locale,
    $loading
  }
}
