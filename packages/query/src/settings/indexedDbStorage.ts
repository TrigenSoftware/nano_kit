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

export function connect(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => resolve(null)

    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: ['shard', 'key']
        })

        store.createIndex('shard', 'shard', {
          unique: false
        })
      }
    }
  })
}

export async function SELECT(
  connection: Promise<IDBDatabase | null>,
  key: CacheKey
): Promise<CacheEntry | null> {
  const db = await connection

  if (!db) {
    return null
  }

  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get([key.shard, key.key])

    request.onerror = () => resolve(null)

    request.onsuccess = () => {
      const result = request.result as StoredEntry | undefined

      if (!result) {
        resolve(null)
        return
      }

      const now = Date.now()

      if (result.expires < now || result.data.expires < now) {
        void DELETE(connection, key)
        resolve(null)
        return
      }

      resolve(result.data)
    }
  })
}

export async function SET(
  connection: Promise<IDBDatabase | null>,
  cacheKey: CacheKey,
  entry: CacheEntry,
  lifetime: number
): Promise<void> {
  const db = await connection

  if (!db) {
    return
  }

  return new Promise((resolve) => {
    const {
      shard,
      key
    } = cacheKey
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const storedEntry: StoredEntry = {
      shard,
      key,
      data: entry,
      expires: Date.now() + lifetime
    }
    const request = store.put(storedEntry)

    request.onerror = () => resolve()
    request.onsuccess = () => resolve()
  })
}

export async function DELETE(
  connection: Promise<IDBDatabase | null>,
  cacheKey: CacheShardKey | CacheKey
): Promise<void> {
  const db = await connection

  if (!db) {
    return
  }

  return new Promise((resolve) => {
    const {
      shard,
      key
    } = cacheKey
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    if (key === undefined) {
      const index = store.index('shard')
      const range = IDBKeyRange.only(shard)
      const request = index.openCursor(range)

      request.onerror = () => resolve()

      request.onsuccess = () => {
        const cursor = request.result

        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
    } else {
      const request = store.delete([shard, key])

      request.onerror = () => resolve()
      request.onsuccess = () => resolve()
    }
  })
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
    get(key: CacheKey) {
      return SELECT(db, key)
    },
    set(cacheKey: CacheKey, entry: CacheEntry, lifetime: number) {
      return SET(db, cacheKey, entry, lifetime)
    },
    delete(cacheKey: CacheShardKey | CacheKey) {
      return DELETE(db, cacheKey)
    }
  }
}
