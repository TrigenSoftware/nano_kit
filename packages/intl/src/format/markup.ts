import { isFunction } from '@nano_kit/store'
import type {
  Format,
  ReadValues
} from './types.js'
import {
  type RichPreformat,
  type RichTags,
  rich
} from './rich.js'

export type MarkupTag<V = undefined> = (chunks: string, values: V) => string

export type MarkupTags<V = undefined> = Record<string, MarkupTag<V>>

/**
 * Creates a markup formatter.
 * @param tags - Tag handlers used to map markup tags to strings.
 * @returns Formatter that returns a mapped string or `undefined`.
 */
export function markup(
  tags: MarkupTags
): Format<string | undefined, string | undefined>

/**
 * Creates a markup formatter with a fallback message.
 * @param fallback - Message used when the input is `undefined` or `null`.
 * @param tags - Tag handlers used to map markup tags to strings.
 * @returns Formatter that returns a mapped string.
 */
export function markup(
  fallback: string,
  tags: MarkupTags
): Format<string | undefined, string>

/**
 * Creates a markup formatter that fills values into the message through a preformat.
 * The preformat gets the whole message, so it can be `params`, `plural`, `match` or a composition of them.
 * Only the tags of the message are mapped: values filled in by the preformat are never parsed as tags.
 * @param tags - Tag handlers used to map markup tags to strings. Each gets the values of the call, read from signals and accessors, as its second argument.
 * @param preformat - Formatter of the message, like `params`, `plural` or `match`.
 * @returns Formatter that returns a message function of the preformat parameters.
 */
export function markup<P, I = string | undefined>(
  tags: MarkupTags<ReadValues<P>>,
  preformat: RichPreformat<P, I>
): Format<I, (params: P) => string | undefined>

/**
 * Creates a markup formatter with a fallback message that fills values into the message through a preformat.
 * The preformat gets the whole message, so it can be `params`, `plural`, `match` or a composition of them.
 * Only the tags of the message are mapped: values filled in by the preformat are never parsed as tags.
 * @param fallback - Message used when the input is `undefined` or `null`.
 * @param tags - Tag handlers used to map markup tags to strings. Each gets the values of the call, read from signals and accessors, as its second argument.
 * @param preformat - Formatter of the message, like `params`, `plural` or `match`.
 * @returns Formatter that returns a message function of the preformat parameters.
 */
export function markup<P, I = string | undefined>(
  fallback: string,
  tags: MarkupTags<ReadValues<P>>,
  preformat: RichPreformat<P, I>
): Format<I, (params: P) => string>

/* @__NO_SIDE_EFFECTS__ */
export function markup<P, I = string | undefined>(
  fallbackOrTags: string | MarkupTags<ReadValues<P>>,
  tagsOrPreformat?: MarkupTags<ReadValues<P>> | RichPreformat<P, I>,
  maybePreformat?: RichPreformat<P, I>
): Format<I, string | ((params: P) => string | undefined) | undefined> {
  let fallback: string | undefined
  let tags = fallbackOrTags as MarkupTags<ReadValues<P>>
  let preformat = maybePreformat

  if (isFunction(tagsOrPreformat)) {
    preformat = tagsOrPreformat
  } else if (tagsOrPreformat) {
    fallback = fallbackOrTags as string
    tags = tagsOrPreformat
  }

  const richTags: RichTags<string, ReadValues<P>> = {}

  for (const [tag, format] of Object.entries(tags)) {
    richTags[tag] = (chunks, _, values) => format(chunks.join(''), values)
  }

  const richFormat = rich(fallback, richTags, preformat)

  return (ctx, input) => {
    const chunks = richFormat(ctx, input)

    return isFunction(chunks)
      ? params => chunks(params)?.join('')
      : chunks?.join('')
  }
}
