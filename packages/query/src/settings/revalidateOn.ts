import {
  type AnyAccessor,
  listen
} from '@nano_kit/store'
import type { ClientSetting } from '../client.types.js'
import type { QueryClientContext } from '../ClientContext.js'
import { addFn } from '../utils.js'

interface RevalidateOnContext extends QueryClientContext {
  revalidateOn?: Set<AnyAccessor>
}

/**
 * Revalidate the query when the reactive condition becomes true.
 * @returns The client setting function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function revalidateOn(...conditions: AnyAccessor[]): ClientSetting<QueryClientContext> {
  return (ctx: RevalidateOnContext) => {
    if (ctx.revalidateOn === undefined) {
      ctx.revalidateOn = new Set()
    }

    conditions.forEach(($condition) => {
      if (!ctx.revalidateOn!.has($condition)) {
        ctx.mounted = addFn(ctx.mounted, function (this: RevalidateOnContext) {
          listen($condition, (visible) => {
            if (visible) {
              this.revalidate(this.$key())
            }
          })
        })

        ctx.revalidateOn!.add($condition)
      }
    })
  }
}
