import { isFunction } from '@nano_kit/store'
import type { Format } from './types.js'
import {
  type RichPreformat,
  type RichTags,
  rich
} from './rich.js'

export type MarkupTag = (chunks: string) => string

export type MarkupTags = Record<string, MarkupTag>

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
 * @param tags - Tag handlers used to map markup tags to strings.
 * @param preformat - Formatter of the message, like `params`, `plural` or `match`.
 * @returns Formatter that returns a message function of the preformat parameters.
 */
export function markup<P, I = string | undefined>(
  tags: MarkupTags,
  preformat: RichPreformat<P, I>
): Format<I, (params: P) => string | undefined>

/**
 * Creates a markup formatter with a fallback message that fills values into the message through a preformat.
 * The preformat gets the whole message, so it can be `params`, `plural`, `match` or a composition of them.
 * Only the tags of the message are mapped: values filled in by the preformat are never parsed as tags.
 * @param fallback - Message used when the input is `undefined` or `null`.
 * @param tags - Tag handlers used to map markup tags to strings.
 * @param preformat - Formatter of the message, like `params`, `plural` or `match`.
 * @returns Formatter that returns a message function of the preformat parameters.
 */
export function markup<P, I = string | undefined>(
  fallback: string,
  tags: MarkupTags,
  preformat: RichPreformat<P, I>
): Format<I, (params: P) => string>

/* @__NO_SIDE_EFFECTS__ */
export function markup<P, I = string | undefined>(
  fallbackOrTags: string | MarkupTags,
  tagsOrPreformat?: MarkupTags | RichPreformat<P, I>,
  maybePreformat?: RichPreformat<P, I>
): Format<I, string | ((params: P) => string | undefined) | undefined> {
  let fallback: string | undefined
  let tags = fallbackOrTags as MarkupTags
  let preformat = maybePreformat

  if (isFunction(tagsOrPreformat)) {
    preformat = tagsOrPreformat
  } else if (tagsOrPreformat) {
    fallback = fallbackOrTags as string
    tags = tagsOrPreformat
  }

  const richTags: RichTags<string> = {}

  for (const [tag, format] of Object.entries(tags)) {
    richTags[tag] = chunks => format(chunks.join(''))
  }

  const richFormat = rich(fallback, richTags, preformat)

  return (ctx, input) => {
    const chunks = richFormat(ctx, input)

    return isFunction(chunks)
      ? params => chunks(params)?.join('')
      : chunks?.join('')
  }
}
