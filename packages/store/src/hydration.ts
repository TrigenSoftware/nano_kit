import {
  type AnyAccessor,
  type AnyWritableSignal,
  ExternalModesBase,
  start,
  InjectionContext,
  run,
  inject,
  observe,
  effect,
  signal,
  trigger
} from 'kida'
import {
  TasksPool$,
  waitTasks
} from './tasks.js'

export interface Hydrator {
  /**
   * Pull a dehydrated value by key and pass it to the receiver function.
   * @param key - The key of the value to pull.
   * @param receiver - The function to receive the pulled value.
   */
  pull(key: string, receiver: (value: unknown) => void): void
  /**
   * Push dehydrated key-value pairs to the hydrator.
   * @param dehydrated - The key-value pairs to push.
   */
  push?(dehydrated: [string, unknown][]): void
}

const HydratedMode = 1 << ExternalModesBase

/**
 * Hydrator for static dehydrated data.
 */
export class StaticHydrator implements Hydrator {
  readonly #$map: Map<string, unknown>

  constructor(
    dehydrated: [string, unknown][]
  ) {
    this.#$map = new Map(dehydrated)
  }

  pull(
    key: string,
    receiver: (value: unknown) => void
  ) {
    const map = this.#$map

    if (map.has(key)) {
      receiver(map.get(key))
      map.delete(key)
    }
  }
}

/**
 * Hydrator for dynamic dehydrated data that can be pushed after creation.
 */
export class ActiveHydrator implements Hydrator {
  readonly #$map = signal(new Map<string, unknown>())

  pull(
    key: string,
    receiver: (value: unknown) => void
  ) {
    effect(() => {
      const map = this.#$map()

      if (map.has(key)) {
        receiver(map.get(key))
        map.delete(key)
      }
    })
  }

  push(dehydrated: [string, unknown][]) {
    trigger(() => {
      const map = this.#$map()

      for (const [key, value] of dehydrated) {
        map.set(key, value)
      }
    })
  }
}

/**
 * Injection token for data hydrator.
 * @returns The data hydrator.
 */
export function Hydrator$(): Hydrator | null {
  return null
}

/**
 * Injection token for hydratable signals.
 * @returns The map of hydratable signals.
 */
export function Hydratables$(): Map<string, AnyAccessor> | null {
  return null
}

/**
 * Mark a signal as hydratable.
 * @param id - The id of the signal.
 * @param $signal - The signal to mark as hydratable.
 * @returns The signal.
 */
export function hydratable<T extends AnyWritableSignal>(id: string, $signal: T): T {
  const hydrator = inject(Hydrator$)

  if (hydrator) {
    hydrator.pull(id, (value) => {
      $signal(value)

      if (!isHydrated($signal)) {
        $signal.node.modes |= HydratedMode

        const stop = observe($signal, () => {
          $signal.node.modes &= ~HydratedMode
          stop()
        })
      }
    })
  } else {
    const hydratables = inject(Hydratables$)

    if (hydratables) {
      hydratables.set(id, $signal)
    }
  }

  return $signal
}

/**
 * Check if a signal has a hydrated value.
 * @param $signal - The signal to check.
 * @returns Whether the signal has been hydrated.
 */
/* @__NO_SIDE_EFFECTS__ */
export function isHydrated($signal: AnyWritableSignal) {
  return ($signal.node.modes & HydratedMode) !== 0
}

/**
 * Run a store runner within an injection context, collect all hydratable signals,
 * wait for async tasks to complete, and return the serializable snapshot.
 * @param runner - A function that initialises stores and returns the accessors to dehydrate.
 * @param context - The injection context to use. Defaults to a new empty context.
 * @returns A tuple of the injection context and the dehydrated key-value pairs.
 */
export async function contextDehydrate(
  runner: () => AnyAccessor[],
  context = new InjectionContext()
) {
  const hydratables = new Map<string, AnyAccessor>()

  context.set(Hydratables$, hydratables)

  const stores = run(context, runner)
  const tasks = context.get(TasksPool$)
  const stop = start(() => stores.forEach(store => store() as void))

  await waitTasks(tasks)

  const dehydrated: [string, unknown][] = []

  hydratables.forEach(($signal, id) => {
    dehydrated.push([id, $signal()])
  })

  stop()

  return [context, dehydrated] as const
}

/**
 * Run a store runner within an injection context, collect all hydratable signals,
 * wait for async tasks to complete, and return the serializable snapshot.
 * @param runner - A function that initialises stores and returns the accessors to dehydrate.
 * @param context - The injection context to use. Defaults to a new empty context.
 * @returns The dehydrated key-value pairs.
 */
export async function dehydrate(
  runner: () => AnyAccessor[],
  context?: InjectionContext
) {
  const [, dehydrated] = await contextDehydrate(runner, context)

  return dehydrated
}
