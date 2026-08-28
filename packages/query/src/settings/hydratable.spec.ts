import {
  vi,
  describe,
  it,
  expect,
  beforeEach
} from 'vitest'
import {
  Hydrator$,
  Hydratables$,
  InjectionContext,
  StaticHydrator,
  JsonCodec,
  effect,
  signal,
  waitTasks,
  run,
  provide
} from '@nano_kit/store'
import { queryKey } from '../cache.js'
import { client } from '../client.js'
import {
  type Post,
  resetMockData,
  getPost
} from '../client.mock.js'
import { hydratable } from './hydratable.js'
import { codec } from './codec.js'

const PostKey = queryKey<[id: number], Post | null>('post')

describe('query', () => {
  describe('settings', () => {
    describe('hydratable', () => {
      beforeEach(() => {
        resetMockData()
      })

      it('should serialize cache to hydratables map', async () => {
        const hydratables = new Map()
        const { query } = client(
          hydratable(null, hydratables)
        )
        const [$post] = query(PostKey, [signal(1)], getPost)
        const off = effect(() => {
          $post()
        })

        await waitTasks($post)

        expect($post()).toEqual({
          id: 1,
          title: 'First Post',
          content: 'Hello World!'
        })

        expect(hydratables.get('@nano_kit/query')!()).toMatchObject([
          [
            'post',
            '[1]',
            {
              rev: expect.any(String),
              dedupes: expect.any(String),
              expires: expect.any(String),
              data: {
                id: 1,
                title: 'First Post',
                content: 'Hello World!'
              },
              error: null,
              loading: false
            }
          ]
        ])

        off()
      })

      it('should use Hydratables$ from context', async () => {
        const context = new InjectionContext([
          provide(Hydratables$, new Map())
        ])
        const { query } = run(context, () => client(
          hydratable()
        ))
        const [$post] = query(PostKey, [signal(1)], getPost)
        const off = effect(() => {
          $post()
        })

        await waitTasks($post)

        expect($post()).toEqual({
          id: 1,
          title: 'First Post',
          content: 'Hello World!'
        })

        expect(context.get(Hydratables$)!.get('@nano_kit/query')!()).toMatchObject([
          [
            'post',
            '[1]',
            {
              rev: expect.any(String),
              dedupes: expect.any(String),
              expires: expect.any(String),
              data: {
                id: 1,
                title: 'First Post',
                content: 'Hello World!'
              },
              error: null,
              loading: false
            }
          ]
        ])

        off()
      })

      it('should serialize and deserialize cache with codec', async () => {
        const hydratables = new Map()
        const { query } = client(
          codec(JsonCodec),
          hydratable(null, hydratables)
        )
        const [$post] = query(PostKey, [signal(1)], getPost)
        const off = effect(() => {
          $post()
        })

        await waitTasks($post)

        const dehydrated = hydratables.get('@nano_kit/query')!()

        expect(dehydrated).toMatchObject([
          [
            'post',
            '[1]',
            {
              rev: expect.any(String),
              dedupes: expect.any(String),
              expires: expect.any(String),
              data: JSON.stringify({
                id: 1,
                title: 'First Post',
                content: 'Hello World!'
              }),
              error: null,
              loading: false
            }
          ]
        ])

        off()

        const { query: hydratedQuery } = client(
          codec(JsonCodec),
          hydratable(new StaticHydrator([
            [
              '@nano_kit/query',
              dehydrated
            ]
          ]))
        )
        const hydratedFetcher = vi.fn(getPost)
        const [$hydratedPost] = hydratedQuery(PostKey, [signal(1)], hydratedFetcher)
        const offHydrated = effect(() => {
          $hydratedPost()
        })

        expect(hydratedFetcher).not.toHaveBeenCalled()
        expect($hydratedPost()).toEqual({
          id: 1,
          title: 'First Post',
          content: 'Hello World!'
        })

        offHydrated()
      })

      it('should deserialize cache from dehydrated map', () => {
        const dehydrated: any = [
          [
            '@nano_kit/query',
            [
              [
                'post',
                '[1]',
                {
                  rev: 1,
                  dedupes: Date.now() + 60000,
                  expires: Date.now() + 60000,
                  data: {
                    id: 1,
                    title: 'Cached Post',
                    content: 'Cached Content'
                  },
                  error: null,
                  loading: false
                }
              ]
            ]
          ]
        ]
        const { query } = client(
          hydratable(new StaticHydrator(dehydrated))
        )
        const fetcher = vi.fn(getPost)
        const [$post] = query(PostKey, [signal(1)], fetcher)
        const off = effect(() => {
          $post()
        })

        expect(fetcher).not.toHaveBeenCalled()

        expect($post()).toEqual({
          id: 1,
          title: 'Cached Post',
          content: 'Cached Content'
        })

        off()
      })

      it('should use Hydrator$ from context', () => {
        const dehydrated: any = [
          [
            '@nano_kit/query',
            [
              [
                'post',
                '[2]',
                {
                  rev: 1,
                  dedupes: Date.now() + 60000,
                  expires: Date.now() + 60000,
                  data: {
                    id: 2,
                    title: 'Injected Post',
                    content: 'Injected Content'
                  },
                  error: null,
                  loading: false
                }
              ]
            ]
          ]
        ]
        const context = new InjectionContext([
          provide(Hydrator$, new StaticHydrator(dehydrated))
        ])
        const { query } = run(context, () => client(
          hydratable()
        ))
        const fetcher = vi.fn(getPost)
        const [$post] = query(PostKey, [signal(2)], fetcher)
        const off = effect(() => {
          $post()
        })

        expect(fetcher).not.toHaveBeenCalled()

        expect($post()).toEqual({
          id: 2,
          title: 'Injected Post',
          content: 'Injected Content'
        })

        off()
      })
    })
  })
})
