import {
  type Signalish,
  $get,
  isFunction
} from '@nano_kit/store'
import type { FormatContext } from '../types.js'
import type {
  Format,
  MessageFormat,
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
  [K in RequiredParamKeys<P>]: Signalish<FormatInput<P[K]>>
} & {
  [K in OptionalParamKeys<P>]?: Signalish<FormatInput<P[K]> | undefined>
}

export type ParamsFn<P extends ParamsFormats> = FnWithParams<ParamsValues<P>>

type PreformatOutput = string | undefined | FnWithParams<any>

type ComposedParamsFn<P extends ParamsFormats, O> = FnWithParams<ParamsValues<P> & UnionToIntersection<ParamsOf<O>>>

type Replace = (ctx: FormatContext, text: string, params: Record<string, Signalish<ReplacementValue>>) => string

/**
 * Creates a parameter interpolation formatter.
 * @param params - Parameter formatters keyed by placeholder name.
 * @returns Formatter that replaces `{key}` placeholders using provided parameter values.
 */
export function params<const P extends ParamsFormats>(
  params: P
): MessageFormat<string | undefined, ParamsFn<P>>

/**
 * Creates a parameter interpolation formatter that first applies another formatter.
 * @param params - Parameter formatters keyed by placeholder name.
 * @param preformat - Formatter applied before replacing placeholders. `match` and `plural` inside it leave the placeholders of the parameters listed here to be replaced by these formatters.
 * @returns Formatter that replaces `{key}` placeholders using provided parameter values.
 */
export function params<
  const P extends ParamsFormats,
  F = string | undefined,
  O extends PreformatOutput = string | undefined | ParamsFn<P>
>(
  params: P,
  preformat: Format<F, O>
): MessageFormat<F, ComposedParamsFn<P, O>>

/* @__NO_SIDE_EFFECTS__ */
export function params<
  const P extends ParamsFormats,
  F = string | undefined,
  O extends PreformatOutput = string | undefined | ParamsFn<P>
>(
  params: P,
  preformat?: Format<F, O>
): Format<F, ComposedParamsFn<P, O>> {
  const keys = Object.keys(params)
  // All placeholders are filled in one pass, so the text of a value is never read for placeholders again
  // and a value with `{key}` in it does not multiply the message. A group per key tells which key matched,
  // in any case of the placeholder
  const placeholder = new RegExp(`{(?:(${keys.join(')|(')}))}`, 'gi')
  const replaceAll: Replace | undefined = keys.length
    ? (ctx, text, values) => text.replace(placeholder, (_, ...groups: unknown[]) => {
      const key = keys[groups.findIndex(Boolean)]
      const formatted = params[key](ctx, $get(values[key]))

      if (import.meta.env.DEV && formatted === undefined) {
        console.warn(`[nano_kit/intl] Parameter "${key}" has no value: the message renders "undefined" in its place`)
      }

      return formatted as string
    })
    : undefined

  return (ctx: FormatContext, input?: F) => {
    const preformatted = (
      preformat
        ? preformat({
          ...ctx,
          f: params
        }, input)
        : input
    ) as PreformatOutput

    if (isFunction(preformatted)) {
      return (values) => {
        const text = preformatted(values)

        if (text === undefined || !replaceAll) {
          return text
        }

        return replaceAll(ctx, text, values)
      }
    }

    if (preformatted === undefined || !replaceAll) {
      return () => preformatted
    }

    return params => replaceAll(ctx, preformatted, params)
  }
}
