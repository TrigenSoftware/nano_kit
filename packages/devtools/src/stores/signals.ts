import {
  signal,
  computed,
  selector,
  action,
  untracked,
  inject
} from '@nano_kit/store'
import type { NodeName } from '../services/naming/index.js'
import {
  type NodeRecord,
  isOwnership,
  previewOf
} from '../services/registry/index.js'
import { PanelStore$ } from './panel.js'
import {
  type NodeRecords,
  RegistryStore$
} from './registry.js'

export interface GraphRow {
  readonly id: number
  /**
   * The child signals taken from this one.
   */
  readonly children: GraphRow[]
}

export interface GraphGroup {
  /**
   * Stays the same between rebuilds of the table: what a list tracks the group by.
   */
  readonly key: string
  /**
   * The function the nodes were created in, or the file for nodes created at module level.
   * None for the nodes whose creation was not seen.
   */
  readonly owner: string | undefined
  readonly file: string | undefined
  readonly rows: GraphRow[]
}

// Shared by every row without children, never written to; a list block wants a plain array type
const NO_ROWS: GraphRow[] = []

// The value is matched by its preview, the line the Value column shows
function matches(record: NodeRecord, query: string) {
  const { name, site, owner } = record.name

  return name.toLowerCase().includes(query)
    || site?.toLowerCase().includes(query)
    || owner?.toLowerCase().includes(query)
    || previewOf(record).toLowerCase().includes(query)
}

/**
 * Every record as it is right now. What the table is built from, the name of a record, its kind
 * and its parent, never changes, so the records are read outside tracking; a filter matches the
 * values too, so a filtered table reads them tracked and is built again as they change.
 * @param records
 * @param tracked - Whether to run again when a record changes.
 * @yields The records in the order of appearance.
 */
function* values(records: NodeRecords, tracked: boolean) {
  for (const id of records.keys()) {
    const record = records.get(id)!

    // An effect or a scope is no row: it shows among the links of what it reads. The kind of a record
    // never changes, so it is read untracked and an effect never builds a filtered table again
    if (!isOwnership(record)) {
      yield tracked ? records.$get(id)! : record
    }
  }
}

/**
 * The records at the other ends of links. Read outside tracking: an end is shown by its name,
 * which never changes, and an end that leaves the registry takes its id out of the links.
 * @param records
 * @param ids - One side of the links of a record.
 * @returns The records that are still there.
 */
function endsOf(records: NodeRecords, ids: number[] = []) {
  const ends: NodeRecord[] = []

  for (const id of ids) {
    const end = records.get(id)

    if (end) {
      ends.push(end)
    }
  }

  return ends
}

/**
 * Child records by the id of their parent. Child signals are rare: most graphs get no map at all.
 * @param records
 * @returns The map, if there is a child.
 */
function childrenByParent(records: NodeRecords) {
  let children: Map<number, NodeRecord[]> | undefined

  for (const record of values(records, false)) {
    if (record.parent !== undefined) {
      const kids = (children ??= new Map<number, NodeRecord[]>()).get(record.parent)

      if (kids) {
        kids.push(record)
      } else {
        children.set(record.parent, [record])
      }
    }
  }

  return children
}

/**
 * A row, built once with its children in hand.
 * @param record
 * @param children - Child records by the id of their parent.
 * @param query - The filter, lower case; empty for none.
 * @returns The row; none when the filter lets neither it nor a child of it through.
 */
function buildRow(
  record: NodeRecord,
  children: Map<number, NodeRecord[]> | undefined,
  query: string
): GraphRow | undefined {
  const kids = children?.get(record.id)
  let rows = NO_ROWS

  if (kids) {
    const built: GraphRow[] = []

    for (const kid of kids) {
      const row = buildRow(kid, children, query)

      if (row) {
        built.push(row)
      }
    }

    rows = built
  }

  return !query || rows.length || matches(record, query)
    ? {
      id: record.id,
      children: rows
    }
    : undefined
}

/**
 * Put a row into the group of its owner and file; a group appears with its first row.
 * @param row
 * @param name - The name of the record of the row.
 * @param groups - The groups in the order of appearance.
 * @param byOwner - The same groups by owner, then by file: no key to concatenate for every record.
 */
function placeRow(
  row: GraphRow,
  { owner, file }: NodeName,
  groups: GraphGroup[],
  byOwner: Map<string | undefined, Map<string | undefined, GraphGroup>>
) {
  let byFile = byOwner.get(owner)
  let group = byFile?.get(file)

  if (!byFile) {
    byOwner.set(owner, byFile = new Map<string | undefined, GraphGroup>())
  }

  if (!group) {
    byFile.set(file, group = {
      key: `${owner}\n${file}`,
      owner,
      file,
      rows: []
    })
    groups.push(group)
  }

  group.rows.push(row)
}

/**
 * The table of the Signals tab, in two passes over the records and with no intermediate copies.
 * @param records
 * @param query - The filter, lower case; empty for none.
 * @returns The groups that have a row to show.
 */
function buildGroups(records: NodeRecords, query: string) {
  const groups: GraphGroup[] = []
  const byOwner = new Map<string | undefined, Map<string | undefined, GraphGroup>>()
  const children = childrenByParent(records)

  for (const record of values(records, query !== '')) {
    // A child is built by its parent
    const row = record.parent === undefined
      ? buildRow(record, children, query)
      : undefined

    if (row) {
      placeRow(row, record.name, groups, byOwner)
    }
  }

  return groups
}

/**
 * The Signals tab over the records of the registry: the table, the selection and what the
 * inspector shows about it.
 * @returns The store.
 */
export function SignalsStore$() {
  const { records } = inject(RegistryStore$)
  const { $filter } = inject(PanelStore$)
  const $selectedId = signal<number>()
  /**
   * The table of the Signals tab: the records grouped by owner in the order of creation, child
   * signals under their parents, the filter applied. Effects and scopes have no rows: they show among
   * the links of what they read and in its count of subscribers.
   * It follows the coming and going of records, not what happens to them: a row does that itself.
   * With a filter set it follows the values too, matched by their previews.
   */
  const $groups = computed(() => {
    const query = $filter().trim().toLowerCase()

    records.$index()

    return buildGroups(records, query)
  })
  /**
   * The selected record; none once it left the registry.
   */
  const $selected = computed(() => {
    const id = $selectedId()

    return id === undefined ? undefined : records.$get(id)
  })
  /**
   * What the selected record reads.
   */
  const $selectedDeps = computed(() => {
    const deps = $selected()?.deps

    return untracked(() => endsOf(records, deps))
  })
  /**
   * What reads the selected record.
   */
  const $selectedSubs = computed(() => {
    const subs = $selected()?.subs

    return untracked(() => endsOf(records, subs))
  })
  /**
   * Whether the record with the id is selected; wakes the two rows a selection moves between.
   */
  const $isSelected = selector($selectedId)
  /**
   * Select the record with the id, or nothing.
   */
  const select = action((id: number | undefined) => {
    $selectedId(id)
  })
  /**
   * Evaluate a computed once, on the word of the user: read it the way the application would.
   * An action reads outside tracking, so the body runs, links its dependencies and caches the value
   * with no subscriber created and nothing mounted. A record reached through a link has no signal,
   * its creation was not seen, and there is nothing to read it with.
   */
  const evaluate = action((record: NodeRecord) => {
    record.signal?.deref()?.()
  })

  return {
    $groups,
    $selected,
    $selectedDeps,
    $selectedSubs,
    $isSelected,
    select,
    evaluate
  }
}
