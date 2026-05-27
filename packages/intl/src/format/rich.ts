import type { Format } from './types.js'

export type RichChunks<T> = (string | T)[]

export type RichTag<T> = (chunks: RichChunks<T>) => T

export type RichTags<T> = Record<string, RichTag<T>>

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
 * Creates a rich-text formatter.
 * @param fallbackOrTags - Fallback message or tag handlers.
 * @param maybeTags - Tag handlers used when fallback is provided.
 * @returns Formatter that returns mapped chunks or `undefined`.
 */
export function rich<T>(
  fallbackOrTags: string | RichTags<T> | undefined,
  maybeTags?: RichTags<T>
): Format<string | undefined, RichChunks<T> | undefined>

/* @__NO_SIDE_EFFECTS__ */
export function rich<T>(
  fallbackOrTags: string | RichTags<T> | undefined,
  maybeTags?: RichTags<T>
): Format<string | undefined, RichChunks<T> | undefined> {
  let fallback: string | undefined
  let tags: RichTags<T>

  if (maybeTags) {
    fallback = fallbackOrTags as string
    tags = maybeTags
  } else {
    tags = fallbackOrTags as RichTags<T>
  }

  return (_ctx: unknown, input?: string) => {
    const text = input ?? fallback

    if (text === undefined) {
      return text
    }

    return mapTags(text, tags)
  }
}

const tagRegex = /<\/?([A-Za-z][\w.-]*)>/g

interface RichFrame<T> {
  tag: string
  chunks: RichChunks<T>
}

/**
 * Maps rich-text tags in a string to chunks using provided tag handlers.
 * Unknown or malformed tags are ignored as markup and only their text content is kept.
 * @param input - Rich-text input string.
 * @param tags - Tag handlers used to map known tags.
 * @returns Mapped chunks.
 */
/* @__NO_SIDE_EFFECTS__ */
export function mapTags<T>(
  input: string,
  tags: RichTags<T>
): RichChunks<T> {
  const root: RichFrame<T> = {
    tag: '',
    chunks: []
  }
  const stack = [root]
  let lastIndex = 0
  let match: RegExpExecArray | null

  while (match = tagRegex.exec(input)) {
    const [rawTag, tag] = match
    const current = stack[stack.length - 1]

    if (match.index > lastIndex) {
      current.chunks.push(input.slice(lastIndex, match.index))
    }

    if (tag in tags) {
      if (rawTag[1] === '/') {
        if (current.tag === tag) {
          stack.pop()
          stack[stack.length - 1].chunks.push(
            tags[tag](current.chunks)
          )
        }
      } else {
        stack.push({
          tag,
          chunks: []
        })
      }
    }

    lastIndex = tagRegex.lastIndex
  }

  if (lastIndex < input.length) {
    stack[stack.length - 1].chunks.push(input.slice(lastIndex))
  }

  for (let i = stack.length - 1; i > 0; i--) {
    const frame = stack[i]

    stack[i - 1].chunks.push(...frame.chunks)
  }

  return root.chunks
}
