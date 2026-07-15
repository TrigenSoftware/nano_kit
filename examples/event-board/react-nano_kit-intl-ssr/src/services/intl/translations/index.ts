export type SupportedLocale = 'en' | 'ru'

export type Translations = Awaited<ReturnType<typeof load>>

export const supportedLocales: SupportedLocale[] = ['en', 'ru']

export async function load(locale: SupportedLocale) {
  let mod

  if (locale === 'en') {
    mod = await import('./en.json')
  } else if (locale === 'ru') {
    mod = await import('./ru.json')
  }

  return mod!.default
}
