import { router } from '@nano_kit/svelte-router'
import {
  type ReadyOptions,
  ready as vanillaReady
} from '@nano_kit/ssr/client'

export * from '@nano_kit/ssr/client'

export interface SvelteReadyOptions extends Omit<ReadyOptions, 'router'> {}

export function ready(options: SvelteReadyOptions) {
  return vanillaReady({
    ...options,
    router
  })
}
