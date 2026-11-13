import type {
  CacheKey,
  CacheShardKey,
  CacheEntry
} from '../CacheStorage.types.js'
import type { Storage } from './persistence.js'

export const DB_NAME = 'nano_kit'
export const STORE_NAME = 'query'
export const DB_VERSION = 1

interface StoredEntry {
  shard: string
  key: string
  data: CacheEntry
  expires: number
}

type Connection = Promise<IDBDatabase | null>

// The result of a request, or `null` when it fails
function settle<T>(request: IDBRequest<T>) {
  return new Promise<T | null>((resolve) => {
    request.onerror = () => resolve(null)
    request.onsuccess = () => resolve(request.result)
  })
}

// One request to the store in a transaction of its own, or `null` without a database
async function run<T>(
  connection: Connection,
  mode: IDBTransactionMode,
  request: (store: IDBObjectStore) => IDBRequest<T>
) {
  const db = await connection

  return db && settle(request(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME)))
}

export function connect(): Connection {
  const request = indexedDB.open(DB_NAME, DB_VERSION)

  // Runs only for a database that is not there yet, so it has no store
  request.onupgradeneeded = () => {
    request.result.createObjectStore(STORE_NAME, {
      keyPath: ['shard', 'key']
    })
  }

  return settle(request)
}

export async function SELECT(
  connection: Connection,
  key: CacheKey
): Promise<CacheEntry | null> {
  const result = await run(
    connection,
    'readonly',
    store => store.get([key.shard, key.key])
  ) as StoredEntry | null | undefined
  const now = Date.now()

  if (!result) {
    return null
  }

  if (result.expires < now || result.data.expires < now) {
    void DELETE(connection, key)

    return null
  }

  return result.data
}

export async function SET(
  connection: Connection,
  {
    shard,
    key
  }: CacheKey,
  entry: CacheEntry,
  lifetime: number
): Promise<void> {
  await run(connection, 'readwrite', store => store.put({
    shard,
    key,
    data: entry,
    expires: Date.now() + lifetime
  } satisfies StoredEntry))
}

export async function DELETE(
  connection: Connection,
  {
    shard,
    key
  }: CacheShardKey | CacheKey
): Promise<void> {
  await run(connection, 'readwrite', store => store.delete(
    key === undefined
      // Every key of the shard: keys are `[shard, key]`, and an array sorts after any string
      ? IDBKeyRange.bound([shard], [shard, []])
      : [shard, key]
  ))
}

/**
 * IndexedDB adapter for persistent storage.
 * @returns IndexedDB storage implementation or null if IndexedDB is not supported.
 */
/* @__NO_SIDE_EFFECTS__ */
export function indexedDbStorage(): Storage | null {
  if (typeof indexedDB === 'undefined') {
    return null
  }

  const db = connect()

  return {
    get: SELECT.bind(null, db),
    set: SET.bind(null, db),
    delete: DELETE.bind(null, db)
  }
}
