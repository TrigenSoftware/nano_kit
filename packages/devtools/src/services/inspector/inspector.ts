import {
  type AnySignal,
  type InspectEvent,
  type ReactiveNode,
  UninspectedMode,
  LinkEvent,
  StopEvent,
  FlushEvent,
  Injectable$,
  onSignal,
  inspect,
  uninspected,
  inject
} from '@nano_kit/store'
import { NamingService$ } from '../naming/index.js'
import {
  parentOf,
  isOwner
} from '../registry/index.js'
import type {
  MeetInspectEvent,
  PanelInspectEvent,
  InspectorEvent,
  InspectorListener
} from './inspector.types.js'

/**
 * A node is met for the first time: created under the eyes of the service, or reached from a known one.
 */
export const MeetEvent = -1

/**
 * The panel is about to run nodes of the application, an evaluation the user asked for: what comes after it
 * up to the end of the flush is the panel's doing, not a reaction of the application.
 */
export const PanelEvent = -2

/**
 * The runtime of the application as a listener hears it. `onSignal` and `inspect` fire in the
 * middle of the application's own work, inside `link()`, inside the evaluation of a computed, where
 * nothing of the panel can be written. So the service does right there only what cannot wait,
 * telling a new node from a known one, taking its call stack and the time, and hands the events
 * of a task over all at once, a microtask later.
 */
export class InspectorService$ extends Injectable$ {
  readonly #naming = inject(NamingService$)
  readonly #met = new WeakSet<ReactiveNode>()

  readonly #listeners = new Set<InspectorListener>()
  #events: InspectorEvent[] = []

  constructor() {
    super()
    // `onSignal` and `inspect` compose and cannot be unsubscribed: the service is one per
    // injection context, so they are installed with it, for good, and are deaf until somebody listens
    onSignal(($signal) => {
      if (this.#listeners.size) {
        this.#meet($signal.node, false, $signal)
      }
    })
    inspect((event) => {
      if (this.#listeners.size) {
        this.#hear(event)
      }
    })
  }

  /**
   * Start listening to the runtime. The listeners are called in the order they started, so one
   * that reads the records of the registry starts after it.
   * @param listener - Called inside `uninspected`: whatever it creates is of the panel.
   * @returns A function to stop. A stopped listener hears nothing more, its last task included.
   */
  listen(listener: InspectorListener) {
    this.#listeners.add(listener)

    return () => {
      this.#listeners.delete(listener)
    }
  }

  /**
   * Run what the panel does to the nodes of the application, an evaluation on the word of the user:
   * a `PanelEvent` goes before the events it causes, so the log tells them from the reactions of the application.
   * @param fn
   */
  act(fn: () => void) {
    if (this.#listeners.size) {
      this.#emit({
        kind: PanelEvent
      })
    }

    fn()
  }

  // The time is taken last: a run is timed from after its node was met, stack and all
  #emit(event: MeetInspectEvent | PanelInspectEvent | InspectEvent) {
    if (this.#events.push({
      ...event,
      time: performance.now()
    }) === 1) {
      queueMicrotask(() => this.#flush())
    }
  }

  #flush() {
    const events = this.#events

    this.#events = []
    uninspected(() => this.#listeners.forEach(listener => listener(events)))
  }

  /**
   * Tell of a node met for the first time, with the call stack of this very moment.
   * @param node
   * @param reached - The node is older than the meeting: the stack belongs to somebody else.
   * @param signal - The signal of the node, when its creation is what is seen.
   * @param walk - The nodes whose links are waiting to be walked, inside a walk.
   * @returns Whether the node is one to tell of: not a node of the panel.
   */
  #meet(node: ReactiveNode, reached: boolean, signal?: AnySignal, walk?: ReactiveNode[]) {
    if (node.modes & UninspectedMode) {
      return false
    }

    if (!this.#met.has(node)) {
      const child = parentOf(node)
      const old = walk ?? []

      // The parent of a child signal is met first, whatever its age: the child is named after it
      if (child) {
        this.#meet(child[0], true, undefined, old)
      }

      this.#met.add(node)
      this.#emit({
        kind: MeetEvent,
        node,
        signal,
        origin: reached ? undefined : this.#naming.capture(),
        reached,
        parent: child?.[0],
        key: child?.[1]
      })

      if (reached) {
        old.push(node)
      }

      if (!walk) {
        this.#reach(old)
      }
    }

    return true
  }

  // A node older than the meeting may have links made before any event could tell about them:
  // walk them, so the graph behind it comes along. A link between two such nodes is met from
  // both of its ends and told of twice
  #reach(old: ReactiveNode[]) {
    while (old.length) {
      const node = old.pop()!

      for (let link = node.deps; link; link = link.nextDep) {
        if (this.#meet(link.dep, true, undefined, old)) {
          this.#emit({
            kind: LinkEvent,
            dep: link.dep,
            sub: node
          })
        }
      }

      for (let link = node.subs; link; link = link.nextSub) {
        if (this.#meet(link.sub, true, undefined, old)) {
          this.#emit({
            kind: LinkEvent,
            dep: node,
            sub: link.sub
          })
        }
      }
    }
  }

  #hear(event: InspectEvent) {
    if ('dep' in event) {
      const { dep, sub } = event

      if (event.kind === LinkEvent) {
        // A read is made while the body of the dependent runs, that is its own stack, and what it reads
        // may be older. An ownership link is made as an effect or a scope is created inside the body
        // of its owner: both are on the stack. The dependent goes first either way, or the walk from
        // an old dependency would take it for an old node too
        this.#meet(sub, 'compute' in sub)
        this.#meet(dep, !isOwner(dep))
        this.#emit(event)
      } else if (this.#met.has(dep) && this.#met.has(sub)) {
        // No meeting: a stopped effect is forgotten already and must not be met again
        this.#emit(event)
      }
    } else if ('node' in event) {
      if (event.kind === StopEvent) {
        if (this.#met.delete(event.node)) {
          this.#emit(event)
        }
      } else {
        this.#meet(event.node, true)
        this.#emit(event)
      }
    } else if (this.#events.length && this.#events[this.#events.length - 1].kind !== FlushEvent) {
      // A flush closes what the application did since the one before. A flush of the panel alone
      // is none of its business, and a flush of the batch the listeners write in would start the
      // next task of events all by itself, and so on for good
      this.#emit(event)
    }
  }
}
