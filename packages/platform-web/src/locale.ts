export interface BrowserLocaleContainer {
  languages?: string[]
  language: string
}

/**
 * Resolves the best browser locale from a language container.
 * @param container - Object containing browser language preferences, such as `navigator`.
 * @param supported - Optional list of supported locale codes to match against.
 * @param fallback - Locale returned when none of the expected locales match.
 * @returns The first matching expected locale, or the first browser locale when `expected` is omitted.
 */
/* @__NO_SIDE_EFFECTS__ */
export function browserLocale(
  container: BrowserLocaleContainer,
  supported?: string[],
  fallback = 'en'
) {
  const languages = container.languages || [container.language]

  if (supported) {
    for (const language of languages) {
      if (supported.includes(language)) {
        return language
      }
    }

    return fallback
  }

  return languages[0]
}
