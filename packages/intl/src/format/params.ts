import {
  type ValueOrAccessor,
  $get,
  isFunction
} from '@nano_kit/store'
import type { FormatContext } from '../types.js'
import type {
  FnWithAnyParams,
  Format,
  FormatInput,
  FormatOutput,
  FnWithParams,
  ParamsOf,
  UnionToIntersection
} from './types.js'

export type ReplacementValue = string | number | boolean | bigint | undefined

export type ParamsFormats = Record<string, Format<any, ReplacementValue>>

export type RequiredParamKeys<P extends ParamsFormats> = {
  [K in keyof P]: undefined extends FormatOutput<P[K]> ? K : never
}[keyof P]

export type OptionalParamKeys<P extends ParamsFormats> = Exclude<keyof P, RequiredParamKeys<P>>

export type ParamsValues<P extends ParamsFormats> = {
  [K in RequiredParamKeys<P>]: ValueOrAccessor<FormatInput<P[K]>>
} & {
  [K in OptionalParamKeys<P>]?: ValueOrAccessor<FormatInput<P[K]> | undefined>
}

export type ParamsFn<P extends ParamsFormats> = FnWithParams<ParamsValues<P>>

type PreformatOutput = string | undefined | FnWithAnyParams

type ComposedParamsFn<P extends ParamsFormats, O> = FnWithParams<ParamsValues<P> & UnionToIntersection<ParamsOf<O>>>

type Replace = (ctx: FormatContext, text: string, params: Record<string, ValueOrAccessor<ReplacementValue>>) => string

/**
 * Creates a parameter interpolation formatter.
 * @param params - Parameter formatters keyed by placeholder name.
 * @returns Formatter that replaces `{key}` placeholders using provided parameter values.
 */
export function params<const P extends ParamsFormats>(
  params: P
): Format<string | undefined, ParamsFn<P>>

/**
 * Creates a parameter interpolation formatter that first applies another formatter.
 * @param params - Parameter formatters keyed by placeholder name.
 * @param preformat - Formatter applied before replacing placeholders.
 * @returns Formatter that replaces `{key}` placeholders using provided parameter values.
 */
export function params<
  const P extends ParamsFormats,
  F = string | undefined,
  O extends PreformatOutput = string | undefined | ParamsFn<P>
>(
  params: P,
  preformat: Format<F, O>
): Format<F, ComposedParamsFn<P, O>>

/* @__NO_SIDE_EFFECTS__ */
export function params<
  const P extends ParamsFormats,
  F = string | undefined,
  O extends PreformatOutput = string | undefined | ParamsFn<P>
>(
  params: P,
  preformat?: Format<F, O>
): Format<F, ComposedParamsFn<P, O>> {
  let replaceAll: Replace | undefined

  for (const [key, format] of Object.entries(params)) {
    const re = new RegExp(`{${key}}`, 'g')
    const replace: Replace = (ctx, text, params) => text.replace(re, format(ctx, $get(params[key])) as string)

    if (replaceAll) {
      const prevReplace = replaceAll

      replaceAll = (ctx, text, params) => replace(ctx, prevReplace(ctx, text, params), params)
    } else {
      replaceAll = replace
    }
  }

  return (ctx: FormatContext, input?: F) => {
    const preformatted = (preformat ? preformat(ctx, input) : input) as PreformatOutput

    if (isFunction(preformatted)) {
      return (params) => {
        const text = preformatted(params)

        if (text === undefined || !replaceAll) {
          return text
        }

        return replaceAll(ctx, text, params)
      }
    }

    if (preformatted === undefined || !replaceAll) {
      return () => preformatted
    }

    return params => replaceAll(ctx, preformatted, params)
  }
}
