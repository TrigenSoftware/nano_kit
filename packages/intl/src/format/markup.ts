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
 * Creates a markup formatter that formats each text piece before the tag handlers get it.
 * Values filled in by the preformat are never parsed as tags.
 * @param tags - Tag handlers used to map markup tags to strings.
 * @param preformat - Formatter of each text piece between the tags, like `params`.
 * @returns Formatter that returns a message function of the preformat parameters.
 */
export function markup<P>(
  tags: MarkupTags,
  preformat: RichPreformat<P>
): Format<string | undefined, (params: P) => string | undefined>

/**
 * Creates a markup formatter with a fallback message that formats each text piece before the tag handlers get it.
 * Values filled in by the preformat are never parsed as tags.
 * @param fallback - Message used when the input is `undefined` or `null`.
 * @param tags - Tag handlers used to map markup tags to strings.
 * @param preformat - Formatter of each text piece between the tags, like `params`.
 * @returns Formatter that returns a message function of the preformat parameters.
 */
export function markup<P>(
  fallback: string,
  tags: MarkupTags,
  preformat: RichPreformat<P>
): Format<string | undefined, (params: P) => string>

/* @__NO_SIDE_EFFECTS__ */
export function markup<P>(
  fallbackOrTags: string | MarkupTags,
  tagsOrPreformat?: MarkupTags | RichPreformat<P>,
  maybePreformat?: RichPreformat<P>
): Format<string | undefined, string | ((params: P) => string | undefined) | undefined> {
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
