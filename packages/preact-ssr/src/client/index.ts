import { router } from '@nano_kit/preact-router'
import {
  type ReadyOptions,
  ready as vanillaReady
} from '@nano_kit/ssr/client'

export * from '@nano_kit/ssr/client'

export interface PreactReadyOptions extends Omit<ReadyOptions, 'router'> {}

export function ready(options: PreactReadyOptions) {
  return vanillaReady({
    ...options,
    router
  })
}
