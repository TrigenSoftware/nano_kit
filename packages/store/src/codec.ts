import { isFunction } from '@nano_kit/store'

export interface Codec<D, E> {
  encode(value: D): E
  decode(value: E | null): D | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyCodec = Codec<any, any>

/**
 * Checks whether a value looks like a codec.
 * @param value - Value to check.
 * @returns `true` when the value has an `encode` function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function isCodec<C extends AnyCodec>(value: unknown): value is C {
  return isFunction((value as C)?.encode)
}

export const NoopCodec: AnyCodec = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  encode: _ => _,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  decode: _ => _
}

/**
 * A codec that encodes values as JSON strings and decodes JSON strings back to values.
 */
export const JsonCodec = {
  encode<T>(value: T): string {
    try {
      return JSON.stringify(value)
    } catch {
      return ''
    }
  },
  decode<T>(value: string | null): T | null {
    try {
      return JSON.parse(value as string) as T
    } catch {
      return null
    }
  }
}

/**
 * A codec that encodes boolean values as '1' and '0' strings and decodes '1' and '0' strings back to boolean values.
 */
export const BooleanCodec: Codec<boolean, string> = {
  encode(value) {
    return value ? '1' : '0'
  },
  decode(value) {
    return value === '1'
  }
}
