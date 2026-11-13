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
    // A set of its own over the inherited one: a condition added for a query
    // stays out of the set of the client, which every other query reads
    const added = ctx.revalidateOn = new Set(ctx.revalidateOn)

    conditions.forEach(($condition) => {
      if (!added.has($condition)) {
        ctx.mounted = addFn(ctx.mounted, function (this: RevalidateOnContext) {
          listen($condition, (visible) => {
            if (visible) {
              this.revalidate(this.$key())
            }
          })
        })

        added.add($condition)
      }
    })
  }
}
