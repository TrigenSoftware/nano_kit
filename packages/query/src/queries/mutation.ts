import {
  type ReadableSignal,
  action,
  batch,
  computed,
  readonly,
  signal,
  task
} from '@nano_kit/store'
import type { ClientSetting } from '../client.types.js'
import {
  type ClientContext,
  type MutationClientContext,
  forkMutationClient
} from '../ClientContext.js'
import { RequestContext } from '../RequestContext.js'

/**
 * Create a mutation that performs data modifications with cache management.
 * @param fn - The mutator function that returns a promise of the result.
 * @param settings - Optional settings for the mutation.
 * @returns A tuple containing the mutate function and signals for data, error, and loading state.
 */
export function mutation<
  P extends unknown[],
  R
>(
  fn: (...args: [...P, requestCtx: RequestContext<R>]) => Promise<R>,
  settings?: ClientSetting<MutationClientContext<R>>[]
): readonly [
  mutate: (...params: P) => Promise<readonly [R | undefined, unknown] | undefined>,
  $data: ReadableSignal<R | null>,
  $error: ReadableSignal<string | null>,
  $loading: ReadableSignal<boolean>
]

/**
 * Create a mutation that performs data modifications with cache management.
 * @param fn - The mutator function that returns a promise of the result.
 * @param settings - Optional settings for the mutation.
 * @returns A tuple containing the mutate function and signals for data, error, and loading state.
 */
export function mutation<
  P extends unknown[],
  R
>(
  fn: (...args: P) => Promise<R>,
  settings?: ClientSetting<MutationClientContext<R>>[]
): readonly [
  mutate: (...params: P) => Promise<readonly [R | undefined, unknown] | undefined>,
  $data: ReadableSignal<R | null>,
  $error: ReadableSignal<string | null>,
  $loading: ReadableSignal<boolean>
]

/* @__NO_SIDE_EFFECTS__ */
export function mutation<
  P extends unknown[],
  R
>(
  this: ClientContext,
  fn: (...args: [...P, requestCtx: RequestContext<R>]) => Promise<R>,
  settings: ClientSetting<MutationClientContext<R>>[] = []
) {
  const clientCtx = forkMutationClient<R>(this, settings)
  const {
    mapComputedData,
    $disabled,
    loadingDedupe
  } = clientCtx
  const $result = signal<R | null>(null)
  const $data = computed(() => mapComputedData($result()))
  const $error = signal<string | null>(null)
  const $loading = signal(false)
  const taskTarget = [$data, $error, $loading]
  let prevRequestCtx: RequestContext<R> | undefined
  const fetch = action((...params: P) => {
    if (
      $disabled?.() === true
      || loadingDedupe && $loading()
    ) {
      return Promise.resolve() as Promise<undefined>
    }

    const requestCtx = prevRequestCtx = new RequestContext(prevRequestCtx)

    return clientCtx.run(
      requestCtx,
      () => {
        $loading(true)

        return fn(...params, requestCtx)
      },
      (data, error) => {
        if (prevRequestCtx === requestCtx) {
          batch(() => {
            if (error === null) {
              $result(data)
            }

            $error(error)
            $loading(false)
          })
        }
      }
    )
  })

  clientCtx.task = promise => task(taskTarget, promise)

  return [
    fetch,
    $data,
    readonly($error),
    readonly($loading)
  ] as const
}
