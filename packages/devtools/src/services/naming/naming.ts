import {
  Injectable$,
  inject
} from '@nano_kit/store'
import { preview } from '../values/index.js'
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

function formatKey(key: unknown, entry: boolean | undefined) {
  // A map is keyed by any value, and a string key is no field
  if (entry) {
    return `[${preview(key)}]`
  }

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
   * @param runner - The name of the computed or the effect whose body was running when the node appeared:
   * the owner of a node libraries created in there.
   * @param entry - The node is an entry of a signals map, whose version is the parent.
   * @returns The name.
   */
  name(
    id: number,
    origin?: NodeOrigin,
    parent?: NodeName,
    key?: unknown,
    runner?: NodeName,
    entry?: boolean
  ): NodeName {
    const [trace, ordinal] = origin ?? []
    const { frame, adapter, inBody } = trace
      ? trace.origin ??= locate(parseStack(trace.stack), this.#library)
      : {}
    const file = inBody ? runner?.file : frame?.file

    return {
      name: parent
        ? parent.name + formatKey(key, entry)
        : this.#unique(moniker(`${trace?.stack ?? id}#${ordinal}`)),
      site: frame && `${basename(frame.file)}:${frame.line}`,
      file,
      owner: inBody ? runner?.owner : frame?.fn ?? (file === undefined ? undefined : basename(file)),
      adapter
    }
  }

  #unique(name: string) {
    const taken = (this.#taken.get(name) ?? 0) + 1

    this.#taken.set(name, taken)

    return taken > 1 ? `${name}-${taken}` : name
  }
}

/**
 * Whether a filter finds a node by its name: the handle, the creation site or the owner.
 * @param name - The name of the node.
 * @param query - The filter, lower case.
 * @returns Whether one of them holds the filter.
 */
export function nameMatches({
  name,
  site,
  owner
}: NodeName, query: string) {
  return name.toLowerCase().includes(query)
    || site?.toLowerCase().includes(query)
    || owner?.toLowerCase().includes(query)
}
