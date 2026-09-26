import type {
  ReactiveNode,
  Link,
  InspectListener,
  LinkInspectEvent,
  UpdateInspectEvent,
  NodeInspectEvent,
  FlushInspectEvent
} from './types.js'
import {
  type FlushEvent,
  UninspectedMode,
  UpdateEvent
} from './flags.js'

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
 * Register an inspect listener. It is called with an event: its `kind` is one
 * of the event constants, a link event carries `dep` and `sub`, a node event
 * carries `node`, and `UpdateEvent` also carries the value the node had before
 * as `oldValue`, left out with the first evaluation of a computed; `RunEvent`
 * and `RunEndEvent` enclose the body of a computed or an effect, so the runs
 * it causes on the way come in between, and `FireEvent` and `FireEndEvent`
 * enclose the lifecycle listeners of a node the same way, but for a listener
 * that throws, which leaves the end out; `FlushEvent` carries the kind alone.
 * The contract exists for the devtools package alone and may change in minor
 * versions. The development build is the only one that reports events, in
 * production this is a no-op.
 * @param listener - The listener, composed with any previous one.
 */
export function inspect(listener: InspectListener) {
  if (import.meta.env.DEV) {
    const prevListener = inspectListener

    inspectListener = prevListener
      ? event => (prevListener(event), listener(event))
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
// is one to keep out. The event object is built here, so nothing is allocated
// while nobody listens
export function report(kind: typeof FlushEvent): void

export function report(kind: LinkInspectEvent['kind'], link: Link): void

export function report(kind: NodeInspectEvent['kind'], node: ReactiveNode): void

export function report(kind: typeof UpdateEvent, node: ReactiveNode, oldValue?: unknown): void

export function report(kind: number, target?: ReactiveNode | Link, oldValue?: unknown) {
  if (inspectListener) {
    if (target === undefined) {
      inspectListener({
        kind
      } as FlushInspectEvent)
    } else if ('dep' in target) {
      if (!((target.dep.modes | target.sub.modes) & UninspectedMode)) {
        inspectListener({
          kind,
          dep: target.dep,
          sub: target.sub
        } as LinkInspectEvent)
      }
    } else if (!(target.modes & UninspectedMode)) {
      // The first evaluation of a computed passes no value before it: its event leaves `oldValue` out
      inspectListener(kind === UpdateEvent && arguments.length > 2
        ? {
          kind,
          node: target,
          oldValue
        }
        : {
          kind,
          node: target
        } as NodeInspectEvent | UpdateInspectEvent)
    }
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
