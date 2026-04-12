import type {
  Args,
  ProjectAnnotations,
  StoryAnnotations,
  ComponentAnnotations,
  ComposedStoryFn
} from 'storybook/internal/types'
import type {
  AnyProps,
  NanoviewsRenderer,
  UniversalProps,
  NanoviewsStoryResult
} from './types.js'

type RenderFn<Props extends AnyProps> = (...args: any[]) => NanoviewsStoryResult<Props>

export function setProjectAnnotations(
  projectAnnotations: ProjectAnnotations<NanoviewsRenderer> | ProjectAnnotations<NanoviewsRenderer>[]
): void

export function composeStory<TArgs extends Args = Args, TStory extends { render?: RenderFn<TArgs> } & StoryAnnotations>(
  story: TStory,
  componentAnnotations: ComponentAnnotations<NanoviewsRenderer, TArgs>,
  projectAnnotations?: ProjectAnnotations<NanoviewsRenderer>,
  exportsName?: string
): ComposedStoryFn<NanoviewsRenderer, UniversalProps<Partial<TArgs>>>

type StoriesWithPartialProps<TModule> = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [K in keyof TModule as K extends 'default' ? never : TModule[K] extends StoryAnnotations<infer _, infer __> ? K : never]: TModule[K] extends { render?: RenderFn<infer TProps> }
    ? ComposedStoryFn<NanoviewsRenderer<TProps>, Partial<UniversalProps<TProps>>>
    : never
}

export function composeStories<Module extends {
  default: Omit<ComponentAnnotations<NanoviewsRenderer<any>, any>, 'decorators'>
}>(
  csfExports: Module,
  projectAnnotations?: ProjectAnnotations<NanoviewsRenderer>
): StoriesWithPartialProps<Module>
