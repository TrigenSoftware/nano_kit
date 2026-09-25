import {
  type ReactiveNode,
  IndexedSignalsMap,
  LinkEvent,
  UpdateEvent,
  RunEvent,
  RunEndEvent,
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
  type MapNode,
  type NodeRecord,
  kindOf,
  parentOf,
  inMap,
  isOwnership,
  stateOf,
  visitStale
} from '../services/registry/index.js'
import {
  type NodeName,
  NamingService$
} from '../services/naming/index.js'

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
  // The names of the computeds and effects whose bodies run at this point of the task, the innermost last
  const running: (NodeName | undefined)[] = []
  const read = (id: number | undefined) => (id === undefined ? undefined : records.get(id))
  /**
   * The record of a node, a node that stopped included.
   * @param node
   * @returns The record; none for a node never met, a node of the panel, and a node met in this very task.
   */
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
  // Take the record out of the links of the others
  const isolate = ({
    id,
    deps,
    subs,
    owned,
    owner
  }: NodeRecord) => {
    deps.forEach(dep => unlist(dep, 'subs', id))
    subs.forEach(sub => unlist(sub, 'deps', id))
    owned.forEach((ownedId) => {
      const other = read(ownedId)

      if (other) {
        write(other, {
          owner: undefined
        })
      }
    })

    if (owner !== undefined) {
      unlist(owner, 'owned', id)
    }
  }
  const remove = (id: number) => {
    const record = read(id)

    if (record) {
      records.delete(id)
      isolate(record)
    }
  }
  // A collected node tells of itself in a task of its own, a node that stopped included
  const collected = new FinalizationRegistry<number>((id) => {
    batch(() => remove(id))
  })
  const add = ({
    node,
    signal,
    origin,
    reached
  }: MeetInspectEvent) => {
    const id = nextId++
    const kind = kindOf(node)
    // Read now, not at the meeting: a map marks an entry right after it made its signal
    const [parentNode, key] = parentOf(node) ?? []
    const parent = parentNode && recordOf(parentNode)

    ids.set(node, id)
    collected.register(node, id)
    write({
      id,
      kind,
      // An entry of a map is keyed by any value, and the index of a map by its field
      name: naming.name(id, origin, parent?.name, key, running.at(-1), parent?.kind === 'map' && kind === 'signal'),
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
  // An entry or the index of a map: their values and their readers are the map's too, and an entry the map let go
  // of leaves with its key. A write nobody reads tells of nothing, so the registry learns of it as the entry is read
  // or let go of
  const settleEntry = (node: ReactiveNode, updated: boolean) => {
    const record = recordOf(node)
    const map = read(record?.parent)

    if (map?.kind === 'map') {
      if (record!.kind === 'signal' && !inMap(node as MapNode)) {
        remove(record!.id)
      } else if (updated || stateOf(map) !== map.state) {
        write(map, {
          updates: map.updates + (updated ? 1 : 0)
        })
      }
    }
  }
  const applyEvent = (event: InspectorEvent) => {
    if (event.kind === MeetEvent) {
      add(event)
    } else if ('dep' in event) {
      const dep = recordOf(event.dep)

      // A link is told of between nodes that were met, and a meeting comes first: both records are there,
      // but for an entry its map let go of, whose record leaves before its readers do
      if (dep) {
        (event.kind === LinkEvent ? attach : detach)(dep, recordOf(event.sub)!)
        settleEntry(event.dep, false)
      }
    } else if (event.kind === StopEvent) {
      // The links a stopped node drops are not told of. Its record stays out of them until the node
      // is collected, so what tells of the stop still names it
      const record = recordOf(event.node)!

      isolate(record)
      write(record, {
        deps: [],
        subs: [],
        owned: [],
        owner: undefined
      })
    } else if ('node' in event) {
      // A flush changes no record: it only closes the transactions of the log
      touch(event.node, event.kind === UpdateEvent)

      if (event.kind === RunEvent) {
        running.push(recordOf(event.node)?.name)
      } else if (event.kind === RunEndEvent) {
        running.pop()
      } else if (event.kind === UpdateEvent) {
        // What an update left out of date got no event of its own
        visitStale(event.node, stale, touch)
        settleEntry(event.node, true)
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
    idOf,
    recordOf
  }
}
