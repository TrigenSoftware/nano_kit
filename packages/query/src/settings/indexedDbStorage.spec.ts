import {
  vi,
  describe,
  it,
  expect,
  beforeEach
} from 'vitest'
import 'fake-indexeddb/auto'
import {
  type TasksPool,
  JsonCodec,
  effect,
  signal,
  tasksRunner,
  waitTasks
} from '@nano_kit/store'
import { queryKey } from '../cache.js'
import { tasks } from '../ClientContext.js'
import { client } from '../client.js'
import {
  type Post,
  resetMockData,
  getPost
} from '../client.mock.js'
import { persistence } from './persistence.js'
import { codec } from './codec.js'
import {
  SELECT,
  STORE_NAME,
  indexedDbStorage,
  connect
} from './indexedDbStorage.js'

const PostKey = queryKey<[id: number], Post | null>('post')

async function clearStore(db: Promise<IDBDatabase | null>) {
  const connection = await db

  if (!connection) {
    return
  }

  return new Promise<void>((resolve) => {
    const transaction = connection.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.clear()

    request.onsuccess = () => resolve()
    request.onerror = () => resolve()
  })
}

describe('query', () => {
  describe('settings', () => {
    describe('indexedDbStorage', () => {
      const tasksPool: TasksPool = new Set()
      const db = connect()

      beforeEach(async () => {
        await clearStore(db)
        tasksPool.clear()
        resetMockData()
      })

      it('should persist entry to IndexedDB', async () => {
        const { query } = client(
          persistence(indexedDbStorage(), 60000),
          tasks(tasksRunner(tasksPool))
        )
        const $id = signal(1)
        const fetcher = vi.fn(getPost)
        const [$data] = query(PostKey, [$id], fetcher)
        const off = effect(() => {
          $data()
        })

        await waitTasks(tasksPool)

        const key = PostKey(1)
        const storedEntry = await SELECT(db, key)

        expect(storedEntry).not.toBe(null)
        expect(storedEntry?.data).toMatchObject({
          id: 1
        })

        off()
      })

      it('should load entry from IndexedDB on mount', async () => {
        const { query } = client(
          persistence(indexedDbStorage(), 60000),
          tasks(tasksRunner(tasksPool))
        )
        const $id = signal(1)
        const fetcher = vi.fn(getPost)
        const [$data] = query(PostKey, [$id], fetcher)
        const off1 = effect(() => {
          $data()
        })

        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(1)
        expect($data()?.id).toBe(1)

        off1()

        const { query: query2 } = client(
          persistence(indexedDbStorage(), 60000),
          tasks(tasksRunner(tasksPool))
        )
        const $id2 = signal(1)
        const fetcher2 = vi.fn(getPost)
        const [$data2] = query2(PostKey, [$id2], fetcher2)
        const off2 = effect(() => {
          $data2()
        })

        await waitTasks(tasksPool)

        expect(fetcher2).not.toHaveBeenCalled()
        expect($data2()?.id).toBe(1)

        off2()
      })

      it('should persist and load entry with codec', async () => {
        const { query } = client(
          codec(JsonCodec),
          persistence(indexedDbStorage(), 60000),
          tasks(tasksRunner(tasksPool))
        )
        const $id = signal(1)
        const fetcher = vi.fn(getPost)
        const [$data] = query(PostKey, [$id], fetcher)
        const off1 = effect(() => {
          $data()
        })

        await waitTasks(tasksPool)

        expect(fetcher).toHaveBeenCalledTimes(1)

        const storedEntry = await SELECT(db, PostKey(1))

        expect(storedEntry?.data).toBe(JSON.stringify({
          id: 1,
          title: 'First Post',
          content: 'Hello World!'
        }))

        off1()
        tasksPool.clear()

        const { query: query2 } = client(
          codec(JsonCodec),
          persistence(indexedDbStorage(), 60000),
          tasks(tasksRunner(tasksPool))
        )
        const fetcher2 = vi.fn(getPost)
        const [$data2] = query2(PostKey, [signal(1)], fetcher2)
        const off2 = effect(() => {
          $data2()
        })

        await waitTasks(tasksPool)

        expect(fetcher2).not.toHaveBeenCalled()
        expect($data2()).toEqual({
          id: 1,
          title: 'First Post',
          content: 'Hello World!'
        })

        off2()
      })

      it('should update entry in IndexedDB on data change', async () => {
        const { query } = client(tasks(tasksRunner(tasksPool)), persistence(indexedDbStorage(), 60000))
        const $id = signal(1)
        const fetcher = vi.fn(getPost)
        const [$data] = query(PostKey, [$id], fetcher)
        const off = effect(() => {
          $data()
        })

        await waitTasks(tasksPool)

        expect(((await SELECT(db, PostKey(1)))?.data as Post)?.id).toBe(1)

        $id(2)
        await waitTasks(tasksPool)

        expect(((await SELECT(db, PostKey(2)))?.data as Post)?.id).toBe(2)

        off()
      })

      it('should delete entry on invalidate', async () => {
        const { query, invalidate } = client(tasks(tasksRunner(tasksPool)), persistence(indexedDbStorage(), 60000))
        const $id1 = signal(1)
        const $id2 = signal(2)
        const fetcher = vi.fn(getPost)
        const [$data1] = query(PostKey, [$id1], fetcher)
        const [$data2] = query(PostKey, [$id2], fetcher)
        const off1 = effect(() => {
          $data1()
        })
        const off2 = effect(() => {
          $data2()
        })

        await waitTasks(tasksPool)

        expect(await SELECT(db, PostKey(1))).not.toBe(null)
        expect(await SELECT(db, PostKey(2))).not.toBe(null)

        invalidate(PostKey(1))

        await waitTasks(tasksPool)

        expect(await SELECT(db, PostKey(1))).toBe(null)
        expect(await SELECT(db, PostKey(2))).not.toBe(null)

        off1()
        off2()
      })

      it('should delete all entries in shard on invalidate with undefined key', async () => {
        const { query, invalidate } = client(
          persistence(indexedDbStorage(), 60000),
          tasks(tasksRunner(tasksPool))
        )
        const $id1 = signal(1)
        const $id2 = signal(2)
        const fetcher = vi.fn(getPost)
        const [$data1] = query(PostKey, [$id1], fetcher)
        const [$data2] = query(PostKey, [$id2], fetcher)
        const off1 = effect(() => {
          $data1()
        })
        const off2 = effect(() => {
          $data2()
        })

        await waitTasks(tasksPool)

        expect(await SELECT(db, PostKey(1))).not.toBe(null)
        expect(await SELECT(db, PostKey(2))).not.toBe(null)

        invalidate(PostKey)

        await waitTasks(tasksPool)

        expect(await SELECT(db, PostKey(1))).toBe(null)
        expect(await SELECT(db, PostKey(2))).toBe(null)

        off1()
        off2()
      })

      it('should delete all entries on invalidate without key', async () => {
        const { query, invalidate } = client(
          persistence(indexedDbStorage(), 60000),
          tasks(tasksRunner(tasksPool))
        )
        const $id1 = signal(1)
        const $id2 = signal(2)
        const fetcher = vi.fn(getPost)
        const [$data1] = query(PostKey, [$id1], fetcher)
        const [$data2] = query(PostKey, [$id2], fetcher)
        const off1 = effect(() => {
          $data1()
        })
        const off2 = effect(() => {
          $data2()
        })

        await waitTasks(tasksPool)

        expect(await SELECT(db, PostKey(1))).not.toBe(null)
        expect(await SELECT(db, PostKey(2))).not.toBe(null)

        invalidate()

        await waitTasks(tasksPool)

        expect(await SELECT(db, PostKey(1))).toBe(null)
        expect(await SELECT(db, PostKey(2))).toBe(null)

        off1()
        off2()
      })
    })
  })
})
