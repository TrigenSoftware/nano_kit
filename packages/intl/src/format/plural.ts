import { isFunction } from '@nano_kit/store'
import { memo } from '../utils.js'
import type {
  AnyFormat,
  Format,
  FormatsInput
} from './types.js'
import {
  type MatchFn,
  type CasesFn,
  match,
  cases
} from './match.js'

export type PluralForm = Intl.LDMLPluralRule

export type PluralKey = PluralForm | `${number}`

export { cases as forms }

/**
 * Creates a plural formatter.
 * @param param - Parameter name used to select plural form and replace `{param}` placeholders.
 * @param forms - Plural form formatters keyed by LDML plural rule or exact numeric value.
 * @returns Formatter that resolves plural forms and returns a parameterized message function.
 */
export function plural<
  const K extends string,
  const B extends Partial<Record<PluralKey, AnyFormat>>
>(
  param: K,
  forms?: CasesFn<K, B>
): Format<
  FormatsInput<B>,
  MatchFn<K, B>
>

/**
 * Creates a plural formatter with `Intl.PluralRules` options.
 * @param param - Parameter name used to select plural form and replace `{param}` placeholders.
 * @param options - `Intl.PluralRules` options.
 * @param forms - Plural form formatters keyed by LDML plural rule or exact numeric value.
 * @returns Formatter that resolves plural forms and returns a parameterized message function.
 */
export function plural<
  const K extends string,
  const B extends Partial<Record<PluralKey, AnyFormat>>
>(
  param: K,
  options: Intl.PluralRulesOptions,
  forms?: CasesFn<K, B>
): Format<
  FormatsInput<B>,
  MatchFn<K, B>
>

/* @__NO_SIDE_EFFECTS__ */
export function plural<
  const K extends string,
  const B extends Partial<Record<PluralKey, AnyFormat>>
>(
  param: K,
  optionsOrForms?: Intl.PluralRulesOptions | CasesFn<K, B>,
  maybeForms?: CasesFn<K, B>
): Format<
  FormatsInput<B>,
  MatchFn<K, B>
> {
  let options: Intl.PluralRulesOptions | undefined
  let forms: CasesFn<K, B> | undefined

  if (isFunction(optionsOrForms)) {
    forms = optionsOrForms
  } else {
    options = optionsOrForms
    forms = maybeForms
  }

  const rules = memo((locale: string) => new Intl.PluralRules(locale, options))

  return match(param, forms, (count, locale, forms) => {
    if (count in forms) {
      return count as string
    }

    let form = rules(locale).select(count as number)

    if (!(form in forms)) {
      form = 'other' in forms ? 'other' : 'many'
    }

    return form
  })
}
