export interface LocalesContainer {
  languages?: readonly string[]
  language: string
}

/**
 * Token for retrieving browser locale preferences.
 * @returns Browser locale preferences.
 */
export function Locales$(): LocalesContainer {
  return navigator
}

/**
 * Resolves the first browser locale from a language container.
 * @param container - Object containing browser language preferences, such as `navigator`.
 * @returns The first browser locale.
 */
export function browserLocale(container: LocalesContainer): string

/**
 * Resolves the best browser locale from a language container.
 * @param container - Object containing browser language preferences, such as `navigator`.
 * @param supported - List of supported locale codes to match against.
 * @returns The first matching supported locale, or `'en'` when none match.
 */
export function browserLocale<const T extends string>(
  container: LocalesContainer,
  supported: readonly T[]
): T | 'en'

/**
 * Resolves the best browser locale from a language container.
 * @param container - Object containing browser language preferences, such as `navigator`.
 * @param supported - List of supported locale codes to match against.
 * @param fallback - Locale returned when none of the supported locales match.
 * @returns The first matching supported locale, or the fallback.
 */
export function browserLocale<const T extends string>(
  container: LocalesContainer,
  supported: readonly T[],
  fallback: T
): T

/* @__NO_SIDE_EFFECTS__ */
export function browserLocale(
  container: LocalesContainer,
  supported?: readonly string[],
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

/**
 * Creates a browser-like locale container from an `Accept-Language` header value.
 * @param acceptLanguage - Raw `Accept-Language` request header value.
 * @returns Locale container ordered by header quality and declaration order.
 */
/* @__NO_SIDE_EFFECTS__ */
export function parseLocales(acceptLanguage = ''): LocalesContainer {
  const entries: {
    index: number
    language: string
    quality: number
  }[] = []
  let index = 0
  let currentLanguage = ''
  let quality = 1
  let param = ''
  let value = ''
  // 0 - language, 1 - parameter name (`q`), 2 - parameter value.
  let mode = 0
  const pushParam = () => {
    if (param === 'q') {
      quality = Number(value)
    }
  }
  const pushEntry = () => {
    if (mode === 0) {
      currentLanguage = value
    } else if (mode === 2) {
      pushParam()
    }

    if (currentLanguage && Number.isFinite(quality) && quality > 0) {
      entries.push({
        index,
        language: currentLanguage,
        quality
      })
    }

    index++
    currentLanguage = ''
    quality = 1
    param = ''
    value = ''
    mode = 0
  }

  for (let i = 0, len = acceptLanguage.length; i < len; i++) {
    const char = acceptLanguage[i]

    if (char === ' ') {
      continue
    } else if (char === ',') {
      pushEntry()
    } else if (char === ';') {
      if (mode === 0) {
        currentLanguage = value
      } else if (mode === 2) {
        pushParam()
      }

      param = ''
      value = ''
      mode = 1
    } else if (char === '=' && mode === 1) {
      param = value
      value = ''
      mode = 2
    } else {
      value += char
    }
  }

  if (value || currentLanguage || param) {
    pushEntry()
  }

  entries.sort((a, b) => b.quality - a.quality || a.index - b.index)

  const languages = Array<string>(entries.length)

  for (let i = 0, len = entries.length; i < len; i++) {
    languages[i] = entries[i].language
  }

  const fallbackLanguage = languages[0] || 'en'

  return {
    language: fallbackLanguage,
    languages: languages.length
      ? languages
      : [fallbackLanguage]
  }
}
