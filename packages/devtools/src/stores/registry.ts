import {
  type ReactiveNode,
  IndexedSignalsMap,
  LinkEvent,
  UpdateEvent,
  StopEvent,
  mountable,
  onMount,
  batch,
  inject
} from '@nano_kit/store'
import {
  type InspectorEvent,
  type MeetInspectEvent,
  MeetEvent,
  InspectorService$
} from '../services/inspector/index.js'
import {
  type NodeRecord,
  kindOf,
  isOwnership,
  stateOf,
  visitStale
} from '../services/registry/index.js'
import { NamingService$ } from '../services/naming/index.js'

/**
 * The records of the registry: a record by the id of its node, each in a signal of its own.
 */
export type NodeRecords = IndexedSignalsMap<number, NodeRecord>

let nextId = 1

function without(ids: number[], id: number) {
  return ids.filter(other => other !== id)
}

/**
 * The reactive graph of the application as the panel reads it: a record per node, each in a signal
 * of its own, written from the events `InspectorService$` hands over once a task. Create the store inside
 * `uninspected`, like everything of the panel.
 * @returns The store.
 */
export function RegistryStore$() {
  const inspector = inject(InspectorService$)
  const naming = inject(NamingService$)
  const records: NodeRecords = new IndexedSignalsMap()
  const ids = new WeakMap<ReactiveNode, number>()
  // What the updates of the task left out of date, visited once
  const stale = new Set<ReactiveNode>()
  const read = (id: number | undefined) => (id === undefined ? undefined : records.get(id))
  const recordOf = (node: ReactiveNode) => read(ids.get(node))
  // A record is never changed in place, and its state is read again with every change
  const write = (record: NodeRecord, change?: Partial<NodeRecord>) => {
    const next = {
      ...record,
      ...change
    }

    next.state = stateOf(next)
    records.set(next.id, next)
  }
  // Take an id out of one side of the links of the record with the other id
  const unlist = (from: number, key: 'deps' | 'subs' | 'owned', id: number) => {
    const other = read(from)

    if (other) {
      write(other, {
        [key]: without(other[key], id)
      })
    }
  }
  const remove = (id: number) => {
    const record = read(id)

    if (record) {
      records.delete(id)
      record.deps.forEach(dep => unlist(dep, 'subs', id))
      record.subs.forEach(sub => unlist(sub, 'deps', id))
      record.owned.forEach((owned) => {
        const other = read(owned)

        if (other) {
          write(other, {
            owner: undefined
          })
        }
      })

      if (record.owner !== undefined) {
        unlist(record.owner, 'owned', id)
      }
    }
  }
  // A collected node tells of itself in a task of its own; a record removed by a stop is simply not found any more
  const collected = new FinalizationRegistry<number>((id) => {
    batch(() => remove(id))
  })
  const add = ({
    node,
    signal,
    origin,
    reached,
    parent: parentNode,
    key
  }: MeetInspectEvent) => {
    const id = nextId++
    const parent = parentNode && recordOf(parentNode)

    ids.set(node, id)
    collected.register(node, id)
    write({
      id,
      kind: kindOf(node),
      name: naming.name(id, origin, parent?.name, key),
      ref: new WeakRef(node),
      signal: signal && new WeakRef(signal),
      parent: parent?.id,
      deps: [],
      subs: [],
      owned: [],
      owner: undefined,
      reached,
      state: 'detached',
      updates: 0
    })
  }
  // A link older than the service is told of from both of its ends: the second time changes nothing
  const attach = (dep: NodeRecord, sub: NodeRecord) => {
    if (isOwnership(dep)) {
      if (dep.owner !== sub.id) {
        write(dep, {
          owner: sub.id
        })
        write(sub, {
          owned: [...sub.owned, dep.id]
        })
      }
    } else if (!sub.deps.includes(dep.id)) {
      write(sub, {
        deps: [...sub.deps, dep.id]
      })
      write(dep, {
        subs: [...dep.subs, sub.id]
      })
    }
  }
  const detach = (dep: NodeRecord, sub: NodeRecord) => {
    if (isOwnership(dep)) {
      write(dep, {
        owner: undefined
      })
      write(sub, {
        owned: without(sub.owned, dep.id)
      })
    } else {
      write(sub, {
        deps: without(sub.deps, dep.id)
      })
      write(dep, {
        subs: without(dep.subs, sub.id)
      })
    }
  }
  // Something happened to the node: it ran, it was mounted, or, with `updated`, its value changed
  const touch = (node: ReactiveNode, updated?: boolean) => {
    const record = recordOf(node)

    if (record && (updated || stateOf(record) !== record.state)) {
      write(record, {
        updates: record.updates + (updated ? 1 : 0)
      })
    }
  }
  const applyEvent = (event: InspectorEvent) => {
    if (event.kind === MeetEvent) {
      add(event)
    } else if ('dep' in event) {
      // A link is told of between nodes that were met, and a meeting comes first: both records are there
      (event.kind === LinkEvent ? attach : detach)(recordOf(event.dep)!, recordOf(event.sub)!)
    } else if (event.kind === StopEvent) {
      remove(ids.get(event.node)!)
      ids.delete(event.node)
    } else {
      touch(event.node, event.kind === UpdateEvent)

      // What an update left out of date got no event of its own
      if (event.kind === UpdateEvent) {
        visitStale(event.node, stale, touch)
      }
    }
  }
  const apply = (events: InspectorEvent[]) => {
    batch(() => {
      events.forEach(applyEvent)
      stale.clear()
    })
  }
  /**
   * The id of the record of a node.
   * @param node
   * @returns The id; none for a node never met, a node of the panel, and a node met in this very task.
   */
  const idOf = (node: ReactiveNode) => ids.get(node)

  // Marked before anybody reads the records: whoever reads them then, a row that follows
  // a single record included, keeps the registry listening
  onMount(mountable(records.$index), () => inspector.listen(apply))

  return {
    records,
    idOf
  }
}
