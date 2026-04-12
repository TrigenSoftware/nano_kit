import type {
  AnnotatedStoryFn,
  Args,
  ArgsFromMeta,
  ComponentAnnotations,
  DecoratorFunction,
  LoaderFunction,
  StoryAnnotations,
  StoryContext as GenericStoryContext,
  StrictArgs,
  ProjectAnnotations
} from 'storybook/internal/types'
import type {
  SetOptional,
  Simplify
} from 'type-fest'
import type {
  NanoviewsRenderer,
  ComponentType,
  RawProps
} from './types.js'

export type { Args, ArgTypes, Parameters, StrictArgs } from 'storybook/internal/types'

/**
 * Metadata to configure the stories for a component.
 * @see [Default export](https://storybook.js.org/docs/formats/component-story-format/#default-export)
 */
export type Meta<CmpOrArgs = Args> = CmpOrArgs extends ComponentType<infer Props>
  ? ComponentAnnotations<NanoviewsRenderer<Props>, RawProps<Props>>
  : ComponentAnnotations<NanoviewsRenderer<CmpOrArgs>, RawProps<CmpOrArgs>>

/**
 * Story function that represents a CSFv2 component example.
 * @see [Named Story exports](https://storybook.js.org/docs/formats/component-story-format/#named-story-exports)
 */
export type StoryFn<CmpOrArgs = Args> = CmpOrArgs extends ComponentType<infer Props>
  ? AnnotatedStoryFn<NanoviewsRenderer<Props>, RawProps<Props>>
  : AnnotatedStoryFn<NanoviewsRenderer<CmpOrArgs>, RawProps<CmpOrArgs>>

/**
 * Story object that represents a CSFv3 component example.
 * @see [Named Story exports](https://storybook.js.org/docs/formats/component-story-format/#named-story-exports)
 */
export type StoryObj<MetaOrCmpOrArgs = Args> = MetaOrCmpOrArgs extends {
  render?: Function
  component?: ComponentType<infer Props>
  args?: infer DefaultArgs
}
  ? Simplify<RawProps<Props> & ArgsFromMeta<NanoviewsRenderer, MetaOrCmpOrArgs>> extends infer TArgs
    ? StoryAnnotations<NanoviewsRenderer<Props>, TArgs, SetOptional<TArgs, Extract<keyof TArgs, keyof DefaultArgs>>>
    : never
  : MetaOrCmpOrArgs extends ComponentType<infer Props>
    ? StoryAnnotations<NanoviewsRenderer<Props>, RawProps<Props>>
    : StoryAnnotations<NanoviewsRenderer<MetaOrCmpOrArgs>, RawProps<MetaOrCmpOrArgs>>

export type { NanoviewsRenderer }

export type Decorator<Args = StrictArgs> = DecoratorFunction<NanoviewsRenderer, Args>
export type Loader<Args = StrictArgs> = LoaderFunction<NanoviewsRenderer, Args>
export type StoryContext<Args = StrictArgs> = GenericStoryContext<NanoviewsRenderer, Args>
export type Preview = ProjectAnnotations<NanoviewsRenderer>
