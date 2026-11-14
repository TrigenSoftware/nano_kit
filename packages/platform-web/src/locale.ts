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
 * Languages are tried in order. An exact tag wins, then any supported locale of the same language:
 * `ro-RO` resolves to `ro`, `pt-PT` to `pt-BR`. Of several locales of one language, the one in the language's
 * likely script and region is taken, then the first in that script: `zh-TW` resolves to `zh-Hant`, `en` to `en-US`.
 * @param container - Object containing browser language preferences, such as `navigator`.
 * @param supported - List of supported locale codes to match against.
 * @returns The supported locale of the first matching language, or `'en'` when none match.
 */
export function browserLocale<const T extends string>(
  container: LocalesContainer,
  supported: readonly T[]
): T | 'en'

/**
 * Resolves the best browser locale from a language container.
 * Languages are tried in order. An exact tag wins, then any supported locale of the same language:
 * `ro-RO` resolves to `ro`, `pt-PT` to `pt-BR`. Of several locales of one language, the one in the language's
 * likely script and region is taken, then the first in that script: `zh-TW` resolves to `zh-Hant`, `en` to `en-US`.
 * @param container - Object containing browser language preferences, such as `navigator`.
 * @param supported - List of supported locale codes to match against.
 * @param fallback - Locale returned when none of the supported locales match.
 * @returns The supported locale of the first matching language, or the fallback.
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
      const base = language.split('-')[0]
      const prefix = `${base}-`
      const locales: string[] = []
      let match: string | undefined

      // One pass over the supported locales: the exact tag wins at once,
      // the locales of the same language are collected.
      for (const tag of supported) {
        if (tag === language) {
          return tag
        }

        if (tag === base || tag.startsWith(prefix)) {
          locales.push(tag)
        }
      }

      // `Intl.Locale` is slow, so it only chooses between several locales of one language,
      // with one `maximize()` per locale: the likely script and region of the language win at once,
      // the first locale in the script waits for the end of the pass.
      // A malformed tag from a request header throws there: what is found so far stays.
      if (locales[1]) {
        try {
          const {
            script,
            region
          } = new Intl.Locale(language).maximize()

          for (const tag of locales) {
            const likely = new Intl.Locale(tag).maximize()

            if (likely.script === script) {
              if (likely.region === region) {
                return tag
              }

              match ||= tag
            }
          }
        } catch {}
      }

      match ||= locales[0]

      if (match) {
        return match
      }
    }

    return fallback
  }

  return languages[0]
}

/**
 * Creates a browser-like locale container from an `Accept-Language` header value.
 * @param acceptLanguage - Raw `Accept-Language` request header value, or `null` when the header is missing.
 * @returns Locale container ordered by header quality and declaration order.
 */
/* @__NO_SIDE_EFFECTS__ */
export function parseLocales(acceptLanguage?: string | null): LocalesContainer {
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

  acceptLanguage ||= ''

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
