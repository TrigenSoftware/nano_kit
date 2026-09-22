import {
  Injectable$,
  inject
} from '@nano_kit/store'
import type {
  LibraryDetector,
  NodeName,
  NodeOrigin,
  StackTrace
} from './naming.types.js'
import {
  basename,
  isLibrary,
  locate,
  parseStack
} from './naming.stack.js'
import { moniker } from './naming.moniker.js'

// Deep enough to get through the panel, the core and a view library down to the application
const STACK_DEPTH = 40
// `stackTraceLimit` is an extension of V8 and JavaScriptCore that the standard typings do not know;
// an engine without it keeps the depth it has
const StackError: ErrorConstructor & { stackTraceLimit?: number } = Error

function captureStack() {
  const limit = StackError.stackTraceLimit

  StackError.stackTraceLimit = STACK_DEPTH

  const { stack } = new StackError()

  StackError.stackTraceLimit = limit

  return stack
}

function formatKey(key: unknown) {
  if (typeof key === 'string') {
    return `.$${key}`
  }

  // A key given as an accessor is not read: reading could evaluate what nobody asked for
  return `[${typeof key === 'function' ? '…' : String(key)}]`
}

/**
 * Which files are libraries: the frames of those are skipped on the way to the application.
 * Provide another rule where the default one does not hold, a workspace that links packages as sources for one.
 * @returns The rule.
 */
export function LibraryDetector$(): LibraryDetector {
  return isLibrary
}

/**
 * Names of reactive nodes. A name comes from the call stack of the moment a node appeared:
 * capturing it is all that moment pays for, the stack is parsed when the name is asked for.
 */
export class NamingService$ extends Injectable$ {
  readonly #library = inject(LibraryDetector$)
  // One per distinct stack: nodes created along the same path share the string and its parse
  readonly #traces = new Map<string, StackTrace>()
  readonly #taken = new Map<string, number>()

  /**
   * Remember the call stack of this very moment. Call it right where a node appears.
   * @returns What to name the node after; none in an engine that gives no stack.
   */
  capture(): NodeOrigin | undefined {
    const stack = captureStack()

    if (stack === undefined) {
      return undefined
    }

    let trace = this.#traces.get(stack)

    if (!trace) {
      this.#traces.set(stack, trace = {
        stack,
        count: 0,
        origin: undefined
      })
    }

    return [trace, ++trace.count]
  }

  /**
   * Name a node: its handle, its creation site and its owner.
   * @param id - Id of the node: what a node without an origin is named after.
   * @param origin - What `capture()` gave when the node appeared; none for a node older than its record.
   * @param parent - For a child signal, the name of the signal it was taken from.
   * @param key - For a child signal, its key in the parent.
   * @returns The name.
   */
  name(id: number, origin?: NodeOrigin, parent?: NodeName, key?: unknown): NodeName {
    const [trace, ordinal] = origin ?? []
    const { frame, adapter } = trace
      ? trace.origin ??= locate(parseStack(trace.stack), this.#library)
      : {}
    const file = frame?.file

    return {
      name: parent
        ? parent.name + formatKey(key)
        : this.#unique(moniker(`${trace?.stack ?? id}#${ordinal}`)),
      site: frame && `${basename(frame.file)}:${frame.line}`,
      file,
      owner: frame?.fn ?? (file === undefined ? undefined : basename(file)),
      adapter
    }
  }

  #unique(name: string) {
    const taken = (this.#taken.get(name) ?? 0) + 1

    this.#taken.set(name, taken)

    return taken > 1 ? `${name}-${taken}` : name
  }
}
