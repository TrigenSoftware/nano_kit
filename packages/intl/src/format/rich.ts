import { isFunction } from '@nano_kit/store'
import type {
  FnWithParams,
  Format
} from './types.js'

export type RichChunks<T> = (string | T)[]

export type RichTag<T> = (chunks: RichChunks<T>, index: number) => T

export type RichTags<T> = Record<string, RichTag<T>>

export type RichPreformat<P, I = string | undefined> = Format<I, FnWithParams<P>>

/**
 * Creates a rich-text formatter.
 * @param tags - Tag handlers used to map rich-text tags to output chunks.
 * @returns Formatter that returns mapped chunks or `undefined`.
 */
export function rich<T>(
  tags: RichTags<T>
): Format<string | undefined, RichChunks<T> | undefined>

/**
 * Creates a rich-text formatter with a fallback message.
 * @param fallback - Message used when the input is `undefined` or `null`.
 * @param tags - Tag handlers used to map rich-text tags to output chunks.
 * @returns Formatter that returns mapped chunks.
 */
export function rich<T>(
  fallback: string,
  tags: RichTags<T>
): Format<string | undefined, RichChunks<T>>

/**
 * Creates a rich-text formatter that fills values into the message through a preformat.
 * The preformat gets the whole message, so it can be `params`, `plural`, `match` or a composition of them.
 * Only the tags of the message are mapped: values filled in by the preformat are never parsed as tags.
 * @param tags - Tag handlers used to map rich-text tags to output chunks.
 * @param preformat - Formatter of the message, like `params`, `plural` or `match`.
 * @returns Formatter that returns a message function of the preformat parameters.
 */
export function rich<T, P, I = string | undefined>(
  tags: RichTags<T>,
  preformat: RichPreformat<P, I>
): Format<I, (params: P) => RichChunks<T> | undefined>

/**
 * Creates a rich-text formatter with a fallback message that fills values into the message through a preformat.
 * The preformat gets the whole message, so it can be `params`, `plural`, `match` or a composition of them.
 * Only the tags of the message are mapped: values filled in by the preformat are never parsed as tags.
 * @param fallback - Message used when the input is `undefined` or `null`.
 * @param tags - Tag handlers used to map rich-text tags to output chunks.
 * @param preformat - Formatter of the message, like `params`, `plural` or `match`.
 * @returns Formatter that returns a message function of the preformat parameters.
 */
export function rich<T, P, I = string | undefined>(
  fallback: string,
  tags: RichTags<T>,
  preformat: RichPreformat<P, I>
): Format<I, (params: P) => RichChunks<T>>

/**
 * Creates a rich-text formatter.
 * @param fallbackOrTags - Fallback message or tag handlers.
 * @param tagsOrPreformat - Tag handlers used when fallback is provided, or the preformat.
 * @param maybePreformat - Formatter of the message used when fallback is provided.
 * @returns Formatter that returns mapped chunks, a message function of them or `undefined`.
 */
export function rich<T, P, I = string | undefined>(
  fallbackOrTags: string | RichTags<T> | undefined,
  tagsOrPreformat?: RichTags<T> | RichPreformat<P, I>,
  maybePreformat?: RichPreformat<P, I>
): Format<I, RichChunks<T> | ((params: P) => RichChunks<T> | undefined) | undefined>

/* @__NO_SIDE_EFFECTS__ */
export function rich<T, P, I = string | undefined>(
  fallbackOrTags: string | RichTags<T> | undefined,
  tagsOrPreformat?: RichTags<T> | RichPreformat<P, I>,
  maybePreformat?: RichPreformat<P, I>
): Format<I, RichChunks<T> | ((params: P) => RichChunks<T> | undefined) | undefined> {
  let fallback: string | undefined
  let tags = fallbackOrTags as RichTags<T>
  let preformat = maybePreformat

  if (isFunction(tagsOrPreformat)) {
    preformat = tagsOrPreformat
  } else if (tagsOrPreformat) {
    fallback = fallbackOrTags as string
    tags = tagsOrPreformat
  }

  return (ctx, input) => {
    const text = markTags(input ?? fallback)

    if (preformat) {
      const message = preformat(ctx, text as I)

      return (params) => {
        const filled = message(params)

        return filled === undefined ? filled : parseTags(filled, tags)
      }
    }

    return text === undefined ? text : parseTags(text as string, tags)
  }
}

// Finds tags. `markTags` puts NUL before the tags of a message, so the message filled with values tells its own tags from the text of the values
// oxlint-disable-next-line eslint/no-control-regex
const tagRegex = /(\0?)<(\/?)([A-Za-z][\w.-]*)\s*(\/?)>/g

interface RichFrame<T> {
  tag: string
  chunks: RichChunks<T>
}

/**
 * Marks the tags of a message, nested in forms and cases at any depth, before values are filled into it.
 * @param input - Message, or forms and cases of messages.
 * @returns Message with marked tags.
 */
/* @__NO_SIDE_EFFECTS__ */
function markTags(input: unknown): unknown {
  if (typeof input === 'string') {
    return input.replace(tagRegex, '\0$&')
  }

  if (input && typeof input === 'object') {
    const marked: Record<string, unknown> = {}

    for (const key in input as Record<string, unknown>) {
      marked[key] = markTags((input as Record<string, unknown>)[key])
    }

    return marked
  }

  return input
}

/**
 * Maps the marked tags of a message to chunks. Other tags stay text.
 * @param input - Message with marked tags.
 * @param tags - Tag handlers used to map known tags.
 * @param formatText - Formatter of each text piece between the tags, applied before the tag handlers get it.
 * @returns Mapped chunks.
 */
/* @__NO_SIDE_EFFECTS__ */
function parseTags<T>(
  input: string,
  tags: RichTags<T>,
  formatText: (text: string) => string = String
): RichChunks<T> {
  const root: RichFrame<T> = {
    tag: '',
    chunks: []
  }
  const stack = [root]
  let lastIndex = 0
  let index = 0
  let match: RegExpExecArray | null

  // reset the shared regex state possibly clobbered by an interrupted outer call
  tagRegex.lastIndex = 0

  while (match = tagRegex.exec(input)) {
    const [, marked, closing, tag, selfClosing] = match

    // A tag in a filled in value is its text
    if (!marked) {
      continue
    }

    const current = stack[stack.length - 1]

    if (match.index > lastIndex) {
      current.chunks.push(formatText(input.slice(lastIndex, match.index)))
    }

    lastIndex = tagRegex.lastIndex

    if (tag in tags) {
      if (closing) {
        if (current.tag === tag) {
          stack.pop()
          stack[stack.length - 1].chunks.push(
            tags[tag](current.chunks, index++)
          )
        }
      } else if (selfClosing) {
        current.chunks.push(tags[tag]([], index++))
      } else {
        stack.push({
          tag,
          chunks: []
        })
      }
    }

    // restore the shared regex state possibly clobbered by a nested call in a tag handler
    tagRegex.lastIndex = lastIndex
  }

  if (lastIndex < input.length) {
    stack[stack.length - 1].chunks.push(formatText(input.slice(lastIndex)))
  }

  for (let i = stack.length - 1; i > 0; i--) {
    const frame = stack[i]

    stack[i - 1].chunks.push(...frame.chunks)
  }

  return root.chunks
}

/**
 * Maps rich-text tags in a string to chunks using provided tag handlers.
 * Each handler call receives an unique index, usable as a key for framework nodes.
 * Self-closing tags are mapped with empty chunks.
 * Unknown or malformed tags are ignored as markup and only their text content is kept.
 * @param input - Rich-text input string.
 * @param tags - Tag handlers used to map known tags.
 * @param formatText - Formatter of each text piece between the tags, applied before the tag handlers get it.
 * @returns Mapped chunks.
 */
/* @__NO_SIDE_EFFECTS__ */
export function mapTags<T>(
  input: string,
  tags: RichTags<T>,
  formatText?: (text: string) => string
): RichChunks<T> {
  return parseTags(markTags(input) as string, tags, formatText)
}
