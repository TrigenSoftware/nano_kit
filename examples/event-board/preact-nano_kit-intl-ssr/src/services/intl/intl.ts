import {
  CookieStore$,
  Locales$,
  browserLocale
} from '@nano_kit/platform-web'
import {
  Injectable$,
  inject
} from '@nano_kit/store'
import {
  type SupportedLocale,
  supportedLocales
} from './translations'

export class IntlService$ extends Injectable$ {
  locales = inject(Locales$)
  cookieStore = inject(CookieStore$)

  getBrowserLocale() {
    return browserLocale(this.locales, supportedLocales, 'en')
  }

  async getServerLocale() {
    const locale = (await this.cookieStore.get('locale'))?.value

    return (locale || this.getBrowserLocale()) as SupportedLocale
  }
}
