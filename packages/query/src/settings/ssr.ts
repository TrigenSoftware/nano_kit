import type { ClientSetting } from '../client.types.js'
import { tasks } from '../ClientContext.js'
import { hydratable } from './hydratable.js'

/**
 * Client setting for enabling SSR support.
 * It combines tasks management and cache hydration to ensure that queries can be executed on the server and their results can be sent to the client for hydration.
 * Should be called inside an injector context.
 * @returns The client setting function.
 */
export function ssr(): ClientSetting {
  const tasksSetting = tasks()
  const hydratableSetting = hydratable()

  return (ctx) => {
    tasksSetting(ctx)
    hydratableSetting(ctx)
  }
}
