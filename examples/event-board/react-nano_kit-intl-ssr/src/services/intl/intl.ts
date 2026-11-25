import {
  CookieStore$,
  Locales$,
  browserLocale,
  selectLocale
} from '@nano_kit/platform-web'
import {
  Injectable$,
  inject
} from '@nano_kit/store'
import { supportedLocales } from './translations'

export class IntlService$ extends Injectable$ {
  locales = inject(Locales$)
  cookieStore = inject(CookieStore$)
  defaultLocale = browserLocale(this.locales, supportedLocales, 'en')

  async getServerLocale() {
    // The cookie comes with the request: a locale the app does not support gives the browser locale
    return selectLocale((await this.cookieStore.get('locale'))?.value, supportedLocales, this.defaultLocale)
  }
}
