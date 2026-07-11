import type {
  WritableSignal,
  Stack,
  ReactiveNode,
  Link,
  AnySignal,
  ReadableNode
} from './types.js'
import {
  ScopeMode,
  LazyMode
} from './flags.js'

type MountedListener = Stack<WritableSignal<boolean>>

let mountedListeners: MountedListener | undefined
let mountedListenersTail: MountedListener | undefined

function queueMounted(onMounted: WritableSignal<boolean>): void {
  const listener: MountedListener = {
    value: onMounted,
    prev: undefined
  }

  if (mountedListenersTail === undefined) {
    mountedListeners = listener
  } else {
    mountedListenersTail.prev = listener
  }

  mountedListenersTail = listener
}

export function notifyMounted(
  activeSub: ReactiveNode | undefined
): void {
  if (
    mountedListeners !== undefined
    && (activeSub === undefined || (activeSub.modes & (ScopeMode | LazyMode)) === ScopeMode)
  ) {
    let listener = mountedListeners

    mountedListeners = undefined
    mountedListenersTail = undefined

    do {
      listener.value(true)
      listener = listener.prev!
    } while (listener !== undefined)
  }
}

/* @__NO_SIDE_EFFECTS__ */
export function isSubscriber(sub: ReactiveNode | ReadableNode): boolean {
  // Is it effect or computed?
  return 'fn' in sub || 'subsCount' in sub
}

/* @__NO_SIDE_EFFECTS__ */
export function isActiveSubscriber(sub: ReactiveNode | ReadableNode): boolean {
  // Is it effect or active computed?
  return 'fn' in sub || 'subsCount' in sub && sub.subsCount > 0
}

export function incrementEffectCount(dep: ReactiveNode | ReadableNode): void {
  if ('subsCount' in dep) {
    dep.subsCount++

    if ('deps' in dep && dep.deps !== undefined) {
      propagateActivation(dep.deps)
    }

    if (dep.subsCount === 1 && 'mounted' in dep) {
      queueMounted(dep.mounted!)
    }
  }
}

function propagateActivation(link: Link): void {
  do {
    incrementEffectCount(link.dep)
    link = link.nextDep!
  } while (link !== undefined)
}

export function decrementEffectCount(
  dep: ReactiveNode | ReadableNode,
  skipPropagation?: boolean
): void {
  if ('subsCount' in dep && dep.subsCount) {
    dep.subsCount--

    if (!skipPropagation && 'deps' in dep && dep.deps !== undefined) {
      propagateDeactivation(dep.deps)
    }

    if (dep.subsCount === 0 && 'mounted' in dep) {
      dep.mounted!(false)
    }
  }
}

function propagateDeactivation(link: Link): void {
  do {
    decrementEffectCount(link.dep)
    link = link.nextDep!
  } while (link !== undefined)
}

// oxlint-disable-next-line import/no-mutable-exports
export let isMountableUsed = false

export function markMountableUsed() {
  isMountableUsed = true
}

// oxlint-disable-next-line import/no-mutable-exports
export let activeNoMount: ReactiveNode | undefined

export function pushNoMount(signal: ReactiveNode | undefined) {
  const prevNoMount = activeNoMount

  activeNoMount = signal

  return prevNoMount
}

export function popNoMount(prevNoMount: ReactiveNode | undefined) {
  activeNoMount = prevNoMount
}

/**
 * Call a function where subscribers created inside will ignore mount of the specified signal.
 * @param $signal - The signal to ignore mount for.
 * @param fn - The function to call.
 * @returns The result of the function.
 */
export function noMount<T>($signal: AnySignal, fn: () => T): T {
  const prevSkipMount = pushNoMount($signal.node)

  try {
    return fn()
  } finally {
    popNoMount(prevSkipMount)
  }
}
