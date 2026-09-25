import type {
  AnySignal,
  ReactiveNode,
  InspectEvent
} from '@nano_kit/store'
import type { NodeOrigin } from '../naming/index.js'
import type {
  MeetEvent,
  PanelEvent
} from './inspector.js'

/**
 * A node is met for the first time. It comes before the first event about the node.
 */
export interface MeetInspectEvent {
  kind: typeof MeetEvent
  node: ReactiveNode
  /**
   * The signal of the node, when its creation is what was seen.
   */
  signal: AnySignal | undefined
  /**
   * The call stack of the moment the node was met, to name it after.
   * None for a node older than the meeting: that stack belongs to somebody else.
   */
  origin: NodeOrigin | undefined
  /**
   * The node is older than the meeting: it was reached through a link or an event, its creation was not seen.
   */
  reached: boolean
}

/**
 * The panel is about to run nodes of the application. It comes before the events it causes.
 */
export interface PanelInspectEvent {
  kind: typeof PanelEvent
}

/**
 * What the service hands over: its own meetings and the events of the runtime, each with the time it was heard.
 * A flush comes only after something of the application: one that moved nothing but the panel is left out.
 * A link older than the service may be told of more than once, as the walk meets it from both of its ends.
 */
export type InspectorEvent = (MeetInspectEvent | PanelInspectEvent | InspectEvent) & {
  /**
   * When the service heard the event, in milliseconds of `performance.now()`.
   */
  time: number
}

/**
 * Called with the events of a task, in their order, a microtask after them.
 */
export type InspectorListener = (events: InspectorEvent[]) => void
