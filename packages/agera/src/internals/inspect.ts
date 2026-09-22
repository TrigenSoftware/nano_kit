import type {
  ReactiveNode,
  Link,
  InspectListener
} from './types.js'
import { UninspectedMode } from './flags.js'

// The inspection layer: a listener the devtools register, and the mute that
// keeps their own nodes out of what it hears. Every path into it is behind
// `import.meta.env.DEV` at its call site in the core, so the production build
// folds the calls away and drops the module with them, down to the two
// public functions - a no-op and a plain call
let inspectListener: InspectListener | undefined
// True while the nodes being created are ones `inspect` must never report:
// inside `uninspected` and while the body of an uninspected node runs. A flag
// of its own, not a property of `activeSub`, which `untracked` clears
let inspectMuted = false

/**
 * Register an inspect listener. It is called with an event kind from the
 * event constants and the node or link the event is about; `FlushEvent`
 * carries no target, `UpdateEvent` also carries the value the node had
 * before. The contract exists for the devtools package alone
 * and may change in minor versions. The development build is the only one
 * that reports events, in production this is a no-op.
 * @param listener - The listener, composed with any previous one.
 */
export function inspect(listener: InspectListener) {
  if (import.meta.env.DEV) {
    const prevListener = inspectListener

    inspectListener = prevListener
      ? (kind, target, oldValue) => (prevListener(kind, target, oldValue), listener(kind, target, oldValue))
      : listener
  }
}

/**
 * Run a function whose reactive nodes stay out of `inspect`: the nodes it
 * creates, and every node their bodies create later, carry `UninspectedMode`
 * and no event about them or their links is reported. It is how the devtools
 * keep their own panel out of the graph they show. The development build is
 * the only one that marks nodes, in production this just calls the function.
 * @param fn - The function to run.
 * @returns The result of the function.
 */
export function uninspected<T>(fn: () => T): T {
  if (import.meta.env.DEV) {
    const prevMuted = inspectMuted

    inspectMuted = true

    try {
      return fn()
    } finally {
      inspectMuted = prevMuted
    }
  }

  return fn()
}

// Tell the listener of an event, unless the node - or an end of the link -
// is one to keep out
export function report(kind: number, target?: ReactiveNode | Link, oldValue?: unknown) {
  if (
    inspectListener
    && (
      target === undefined
      || !(('dep' in target ? target.dep.modes | target.sub.modes : target.modes) & UninspectedMode)
    )
  ) {
    inspectListener(kind, target, oldValue)
  }
}

// Keep out a node created while the inspection is muted
export function inheritInspection(node: ReactiveNode) {
  if (inspectMuted) {
    node.modes |= UninspectedMode
  }
}

// Run the body of a node with the inspection state of that node, so whatever
// the body creates inherits it. The production build calls the body directly:
// the call sites fold to it and no local is left behind for a bundler to keep
export function callInspected<A extends unknown[], R>(
  node: ReactiveNode,
  fn: (this: never, ...args: A) => R,
  ...args: A
): R {
  const prevMuted = inspectMuted

  inspectMuted = (node.modes & UninspectedMode) > 0

  try {
    return fn.apply(node as never, args)
  } finally {
    inspectMuted = prevMuted
  }
}
