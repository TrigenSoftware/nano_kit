import {
  type AnyAccessor,
  type AnyWritableSignal,
  type Accessor,
  ExternalModesBase,
  start,
  InjectionContext,
  run,
  inject,
  observe,
  computed,
  effect
} from 'kida'
import {
  TasksPool$,
  waitTasks
} from './tasks.js'

/**
 * A function that hydrates a signal by key, calling the setter with the stored value.
 * @param key - The id of the signal to hydrate.
 * @param setter - A callback that receives the stored value and applies it to the signal.
 */
export type Hydrator = (key: string, setter: (value: unknown) => void) => void

const HydratedMode = 1 << ExternalModesBase

/**
 * Create a hydrator from a static dehydrated snapshot.
 * @param dehydrated - The dehydrated data as an array of key-value pairs or a Map.
 * @param parent - An optional parent hydrator to fall back to when the key is not found.
 * @returns The hydrator function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function hydrator(
  dehydrated: [string, unknown][] | Map<string, unknown>,
  parent?: Hydrator | null
): Hydrator {
  const dehydratedMap = new Map<string, unknown>(dehydrated)

  return (key, setter) => {
    if (dehydratedMap.has(key)) {
      setter(dehydratedMap.get(key))
      dehydratedMap.delete(key)
    } else if (parent) {
      parent(key, setter)
    }
  }
}

/**
 * Create a hydrator from a reactive dehydrated snapshot.
 * Re-runs hydration whenever the snapshot signal changes.
 * @param $dehydrated - A signal holding the dehydrated data.
 * @param parent - An optional parent hydrator to fall back to when the key is not found.
 * @returns The hydrator function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function activeHydrator(
  $dehydrated: Accessor<[string, unknown][] | Map<string, unknown>>,
  parent?: Hydrator | null
): Hydrator {
  const $dehydratedMap = computed(() => new Map<string, unknown>($dehydrated()))

  return (key, setter) => {
    effect(() => {
      const dehydratedMap = $dehydratedMap()

      if (dehydratedMap.has(key)) {
        setter(dehydratedMap.get(key))
        dehydratedMap.delete(key)
      } else if (parent) {
        parent(key, setter)
      }
    })
  }
}

/**
 * Injection token for data hydrator function.
 * @returns The data hydrator function.
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
  const hydrate = inject(Hydrator$)

  if (hydrate) {
    hydrate(id, (value) => {
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
