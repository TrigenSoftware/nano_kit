import {
  type ValueOrAccessor,
  $get,
  identity,
  isFunction
} from '@nano_kit/store'
import type { FormatContext } from '../types.js'
import type {
  AnyFormat,
  FnWithParams,
  Format,
  FormatsInput,
  UnionToIntersection,
  ParamsOf
} from './types.js'

type CaseParams<F> = F extends AnyFormat<infer O> ? ParamsOf<O> : {}

export type MatchParams<
  K extends string,
  B extends Partial<Record<string, AnyFormat>>
> = {
  [P in K]: ValueOrAccessor<number | string>
} & UnionToIntersection<CaseParams<B[keyof B]>>

export type ArgMatchFn = FnWithParams<ValueOrAccessor<number | string>>

export type MatchFn<
  K extends string,
  B extends Partial<Record<string, AnyFormat>>
> = FnWithParams<MatchParams<K, B> | ValueOrAccessor<number | string>>

export type CasesFn<
  K extends string,
  B extends Partial<Record<string, AnyFormat>>
> = (
  ctx: FormatContext,
  input: FormatsInput<B> | undefined,
  resolvedCases: Record<string, string | undefined | MatchFn<K, B>>
) => void

/**
 * Creates a reusable cases resolver for `match`.
 * @param cases - Case formatters keyed by possible resolved values.
 * @returns Resolver that formats all cases for the current context and translation input.
 */
/* @__NO_SIDE_EFFECTS__ */
export function cases<
  const K extends string,
  const B extends Partial<Record<string, AnyFormat>>
>(
  cases: B
): CasesFn<K, B> {
  const entries = Object.entries(cases)

  return (ctx, input, resolvedCases) => {
    for (const [key, format] of entries) {
      resolvedCases[key] = format!(ctx, input?.[key]) as string | undefined | MatchFn<K, B>
    }
  }
}

/**
 * Creates a formatter that selects one case by parameter value.
 * @param param - Parameter name used to select a case and replace `{param}` placeholders.
 * @param cases - Case formatters keyed by possible resolved values.
 * @param getKey - Optional resolver used to map the parameter value to a case key.
 * @returns Formatter that resolves cases and returns a parameterized message function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function match<
  const K extends string,
  const B extends Partial<Record<string, AnyFormat>>
>(
  param: K,
  cases?: CasesFn<K, B>,
  getKey: (
    param: any,
    locale: string,
    cases: Record<string, unknown>
  ) => string = identity
): Format<
  FormatsInput<B>,
  MatchFn<K, B>
> {
  const valuePattern = new RegExp(`{${param}}`, 'g')

  return (ctx, input: FormatsInput<B> | undefined) => {
    const locale = ctx.$locale()
    let resolvedCases: Record<string, string | undefined | MatchFn<K, B>> = input ?? {}

    if (cases) {
      resolvedCases = {
        ...resolvedCases
      }

      cases(ctx, input, resolvedCases)
    }

    return (params) => {
      const value = $get(typeof params === 'object' ? params[param] : params)
      const key = getKey(value, locale, resolvedCases)
      const resolvedCase = resolvedCases[key]
      const message = isFunction(resolvedCase) ? resolvedCase(params) : resolvedCase

      return message?.replace(valuePattern, value as string)
    }
  }
}
