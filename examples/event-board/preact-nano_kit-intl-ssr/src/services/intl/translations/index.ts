import type { AnyTranslationData } from '@nano_kit/intl'

export type SupportedLocale = 'en' | 'ru'

export const supportedLocales: SupportedLocale[] = ['en', 'ru']

export async function load(locale: SupportedLocale, namespace: string) {
  let mod

  if (locale === 'en') {
    mod = await import('./en.json')
  } else if (locale === 'ru') {
    mod = await import('./ru.json')
  }

  return (mod!.default as AnyTranslationData)[namespace]
}
