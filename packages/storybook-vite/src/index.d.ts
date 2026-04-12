import type {
  CompatibleString,
  StorybookConfig as StorybookConfigBase
} from 'storybook/internal/types'
import type {
  BuilderOptions,
  StorybookConfigVite
} from '@storybook/builder-vite'

export * from '@nanoviews/storybook'

type FrameworkName = CompatibleString<'@nanoviews/storybook-vite'>
type BuilderName = CompatibleString<'@storybook/builder-vite'>

export interface FrameworkOptions {
  builder?: BuilderOptions
}

interface StorybookConfigFramework {
  framework:
    | FrameworkName
    | {
      name: FrameworkName
      options: FrameworkOptions
    }
  core?: StorybookConfigBase['core'] & {
    builder?:
      | BuilderName
      | {
        name: BuilderName
        options: BuilderOptions
      }
  }
}

/** The interface for Storybook configuration in `main.ts` files. */
export type StorybookConfig = Omit<
  StorybookConfigBase,
  keyof StorybookConfigVite | keyof StorybookConfigFramework
>
  & StorybookConfigVite
  & StorybookConfigFramework
