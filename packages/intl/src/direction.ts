import {
  type Accessor,
  computed
} from '@nano_kit/store'

export const rtlLocales = new Set([
  'ar', // Arabic
  'arc', // Aramaic
  'dv', // Divehi
  'fa', // Persian
  'ha', // Hausa
  'he', // Hebrew
  'khw', // Khowar
  'ks', // Kashmiri
  'ku', // Kurdish
  'ps', // Pashto
  'ur', // Urdu
  'yi' // Yiddish
])

/**
 * Resolves text direction for a locale.
 * @param locale - BCP 47 locale code.
 * @returns `rtl` for right-to-left languages, otherwise `ltr`.
 */
/* @__NO_SIDE_EFFECTS__ */
export function getDirection(locale: string) {
  const lang = new Intl.Locale(locale).language

  return rtlLocales.has(lang) ? 'rtl' : 'ltr'
}

/**
 * Creates a computed text direction from a locale accessor.
 * @param $locale - Active locale accessor.
 * @returns Signal with `rtl` or `ltr` direction.
 */
/* @__NO_SIDE_EFFECTS__ */
export function direction<T extends string>($locale: Accessor<T>) {
  return computed(() => getDirection($locale()))
}
