import {
  vi,
  describe,
  it,
  expect,
  beforeEach
} from 'vitest'
import {
  effect,
  signal
} from '@nano_kit/store'
import {
  queryKey,
  operationKey
} from '../cache.js'
import {
  client,
  operations
} from '../client.js'
import {
  type Post,
  type UpdatePostParams,
  resetMockData,
  getPost,
  updatePost
} from '../client.mock.js'
import { dedupe } from '../ClientContext.js'
import { previous } from '../RequestContext.js'
import { required } from './base.js'

const PostKey = queryKey<[id: number], Post | null>('post')
const UpdatePostKey = operationKey<[id: number], [params: UpdatePostParams], Post | null>('updatePost')

describe('query', () => {
  describe('queries', () => {
    describe('operation', () => {
      beforeEach(() => {
        resetMockData()
      })

      it('should fetch on demand', async () => {
        const { operation } = client(operations())
        const $postId = signal(1)
        const dataSpy = vi.fn()
        const [fetch, $data, , $loading] = operation(PostKey, [$postId], getPost)
        const off = effect(() => {
          dataSpy($data())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)

        const promise = fetch()

        expect($loading()).toBe(true)

        const result = await promise

        expect(result).toEqual([
          {
            id: 1,
            title: 'First Post',
            content: 'Hello World!'
          },
          undefined
        ])

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect(dataSpy).toHaveBeenLastCalledWith({
          id: 1,
          title: 'First Post',
          content: 'Hello World!'
        })
        expect($data()?.title).toBe('First Post')
        expect($loading()).toBe(false)

        off()
      })

      it('should return error from fetch', async () => {
        const { operation } = client(operations())
        const $postId = signal(1)
        const dataSpy = vi.fn()
        const error = new Error('Fetch failed')
        const failingFetcher = vi.fn().mockRejectedValue(error)
        const [fetch, $data, $error] = operation(PostKey, [$postId], failingFetcher)
        const off = effect(() => {
          dataSpy($data())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)

        const result = await fetch()

        expect(result).toEqual([undefined, error])
        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenLastCalledWith(null)
        expect($error()).toBe('Fetch failed')

        off()
      })

      it('should not fetch while a required parameter has no value', async () => {
        const { operation } = client(operations())
        const $postId = signal<number | undefined>(undefined)
        const fetcher = vi.fn(getPost)
        const [fetch, $data, , $loading] = operation(PostKey, [required($postId)], fetcher)
        const off = effect(() => {
          $data()
        })

        expect(await fetch()).toBeUndefined()
        expect($loading()).toBe(false)
        expect(fetcher).not.toHaveBeenCalled()

        $postId(1)

        await fetch()

        expect(fetcher).toHaveBeenCalledTimes(1)
        expect($data()?.title).toBe('First Post')

        off()
      })

      it('should pass extra params to fetcher', async () => {
        const { operation } = client(operations())
        const $postId = signal(1)
        const dataSpy = vi.fn()
        const [update, $data, , $loading] = operation(UpdatePostKey, [$postId], updatePost)
        const off = effect(() => {
          dataSpy($data())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)

        const promise = update({
          title: 'Updated Title',
          content: 'Updated Content'
        })

        expect($loading()).toBe(true)

        const result = await promise

        expect(result).toEqual([
          {
            id: 1,
            title: 'Updated Title',
            content: 'Updated Content'
          },
          undefined
        ])

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect(dataSpy).toHaveBeenLastCalledWith({
          id: 1,
          title: 'Updated Title',
          content: 'Updated Content'
        })
        expect($data()?.title).toBe('Updated Title')
        expect($loading()).toBe(false)

        off()
      })

      it('should work without dedupe', async () => {
        const { operation } = client(operations())
        const $postId = signal(1)
        const dataSpy = vi.fn()
        const [update, $data, , $loading] = operation(UpdatePostKey, [$postId], updatePost, [dedupe(false)])
        const off = effect(() => {
          dataSpy($data())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)

        const promise = update({
          title: 'Updated Title',
          content: 'Updated Content'
        })
        const promise2 = update({
          title: 'Another Update',
          content: 'More Content'
        })

        expect($loading()).toBe(true)

        await Promise.all([promise, promise2])

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect(dataSpy).toHaveBeenLastCalledWith({
          id: 1,
          title: 'Another Update',
          content: 'More Content'
        })
        expect($data()?.title).toBe('Another Update')
        expect($loading()).toBe(false)

        off()
      })

      it('should handle concurrent requests', async () => {
        const { operation } = client(operations())
        const $postId = signal(1)
        const dataSpy = vi.fn()
        let latency = 200
        const [update, $data, , $loading] = operation(
          UpdatePostKey,
          [$postId],
          (id, params) => new Promise<Post | null>((resolve) => {
            setTimeout(() => {
              resolve(updatePost(id, params))
            }, latency)
          }),
          [dedupe(false)]
        )
        const off = effect(() => {
          dataSpy($data())
        })

        expect(dataSpy).toHaveBeenCalledTimes(1)
        expect(dataSpy).toHaveBeenCalledWith(null)

        const promise = update({
          title: 'Updated Title',
          content: 'Updated Content'
        })

        latency = 0

        const promise2 = update({
          title: 'Another Update',
          content: 'More Content'
        })

        expect($loading()).toBe(true)

        await Promise.all([promise, promise2])

        expect(dataSpy).toHaveBeenCalledTimes(2)
        expect(dataSpy).toHaveBeenLastCalledWith({
          id: 1,
          title: 'Another Update',
          content: 'More Content'
        })
        expect($data()?.title).toBe('Another Update')
        expect($loading()).toBe(false)

        off()
      })

      it('should run requests one after another with previous', async () => {
        const { operation } = client(operations())
        const $postId = signal(1)
        const calls: string[] = []
        const [update, $data, , $loading] = operation(
          UpdatePostKey,
          [$postId],
          async (id, params, ctx) => {
            await previous(ctx)

            calls.push(`start ${params.title}`)

            await new Promise(resolve => setTimeout(resolve, params.title === 'First' ? 20 : 0))

            calls.push(`end ${params.title}`)

            return updatePost(id, params)
          },
          [dedupe(false)]
        )
        const promise = update({
          title: 'First'
        })
        const promise2 = update({
          title: 'Second'
        })

        expect($loading()).toBe(true)

        await Promise.all([promise, promise2])

        expect(calls).toEqual([
          'start First',
          'end First',
          'start Second',
          'end Second'
        ])
        expect($data()?.title).toBe('Second')
        expect($loading()).toBe(false)
      })
    })
  })
})
