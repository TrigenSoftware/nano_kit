import {
  describe,
  it,
  expect,
  beforeEach
} from 'vitest'
import {
  type TasksPool,
  Hydrator$,
  Hydratables$,
  InjectionContext,
  effect,
  signal,
  tasksRunner,
  waitTasks,
  run,
  provide,
  StaticHydrator
} from '@nano_kit/store'
import { queryKey } from '../cache.js'
import { tasks } from '../ClientContext.js'
import { client } from '../client.js'
import {
  type Post,
  resetMockData,
  getPost
} from '../client.mock.js'
import { hydratable } from './hydratable.js'

const PostKey = queryKey<[id: number], Post | null>('post')

describe('query', () => {
  describe('settings', () => {
    describe('hydratable', () => {
      const tasksPool: TasksPool = new Set()

      beforeEach(() => {
        tasksPool.clear()
        resetMockData()
      })

      it('should serialize cache to hydratables map', async () => {
        const hydratables = new Map()
        const { query } = client(
          tasks(tasksRunner(tasksPool)),
          hydratable(null, hydratables)
        )
        const [$post] = query(PostKey, [signal(1)], getPost)
        const off = effect(() => {
          $post()
        })

        await waitTasks(tasksPool)

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
          tasks(tasksRunner(tasksPool)),
          hydratable()
        ))
        const [$post] = query(PostKey, [signal(1)], getPost)
        const off = effect(() => {
          $post()
        })

        await waitTasks(tasksPool)

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
          tasks(tasksRunner(tasksPool)),
          hydratable(new StaticHydrator(dehydrated))
        )
        const [$post] = query(PostKey, [signal(1)], getPost)
        const off = effect(() => {
          $post()
        })

        expect(tasksPool.size).toBe(0)

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
          tasks(tasksRunner(tasksPool)),
          hydratable()
        ))
        const [$post] = query(PostKey, [signal(2)], getPost)
        const off = effect(() => {
          $post()
        })

        expect(tasksPool.size).toBe(0)

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
