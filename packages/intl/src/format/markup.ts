import type { Format } from './types.js'
import {
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

/* @__NO_SIDE_EFFECTS__ */
export function markup(
  fallbackOrTags: string | MarkupTags,
  maybeTags?: MarkupTags
): Format<string | undefined, string | undefined> {
  let fallback: string | undefined
  let tags: MarkupTags

  if (maybeTags) {
    fallback = fallbackOrTags as string
    tags = maybeTags
  } else {
    tags = fallbackOrTags as MarkupTags
  }

  const richTags: RichTags<string> = {}

  for (const [tag, format] of Object.entries(tags)) {
    richTags[tag] = chunks => format(chunks.join(''))
  }

  const richFormat = rich(fallback, richTags)

  return (ctx, input) => richFormat(ctx, input)?.join('')
}
