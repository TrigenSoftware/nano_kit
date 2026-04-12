import type {
  StoryContext as StoryContextBase,
  WebRenderer
} from 'storybook/internal/types'
import type {
  AnyWritableSignal,
  WritableSignal,
  AnyFn
} from 'kida'
import type {
  Child,
  NonEmptyValue,
  EmptyValue
} from 'nanoviews'

export type { RenderContext } from 'storybook/internal/types'

export type AnyProps = Record<string, any>

type OrAnyProps<T> = T extends AnyProps ? T : AnyProps

export type UniversalProps<T extends AnyProps> = {
  [K in keyof T]: T[K] extends EmptyValue
    ? T[K]
    : NonEmptyValue<T[K]> extends AnyFn
      ? T[K]
      : T[K] extends AnyWritableSignal
        ? T[K]
        : Exclude<T[K], AnyWritableSignal> extends infer Primitive
          ? Primitive | WritableSignal<Primitive> | Extract<T[K], AnyWritableSignal>
          : never
}

export type StoreProps<T extends AnyProps> = {
  [K in keyof T]: T[K] extends EmptyValue
    ? T[K]
    : NonEmptyValue<T[K]> extends AnyFn
      ? T[K]
      : T[K] extends AnyWritableSignal
        ? T[K]
        : Exclude<T[K], AnyWritableSignal> extends infer Primitive
          ? WritableSignal<Primitive> | Extract<T[K], AnyWritableSignal>
          : never
}

export type RawProps<T extends AnyProps> = {
  [K in keyof T]: T[K] extends EmptyValue
    ? T[K]
    : NonEmptyValue<T[K]> extends AnyFn
      ? T[K]
      : T[K] extends infer V
        ? V extends WritableSignal<infer U>
          ? U
          : V
        : never
}

export type ComponentType<Props extends AnyProps = AnyProps> = (props: Props) => Child

export type NanoviewsStoryResult<Props extends AnyProps = AnyProps> = readonly [ComponentType<StoreProps<Props>>, RawProps<Props>]

export interface NanoviewsRenderer<Props extends AnyProps = null> extends WebRenderer {
  component: ComponentType<OrAnyProps<Props extends null ? this['T'] : Props>>
  storyResult: NanoviewsStoryResult<OrAnyProps<Props extends null ? this['T'] : Props>>
}

export type StoryContext = StoryContextBase<NanoviewsRenderer>
