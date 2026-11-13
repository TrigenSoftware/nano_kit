import {
  describe,
  it,
  expect,
  expectTypeOf,
  beforeEach
} from 'vitest'
import {
  effect,
  signal,
  waitTasks
} from '@nano_kit/store'
import {
  type Post,
  type PostsPage,
  resetMockData,
  getPost,
  getPosts,
  updatePost
} from '../client.mock.js'
import { onError } from '../RequestContext.js'
import {
  type InfinitePages,
  client,
  mutations,
  infinites
} from '../client.js'
import { queryKey } from '../cache.js'
import { required } from '../queries/base.js'
import {
  prepend,
  mapPages
} from '../utils.js'
import {
  entity,
  entities
} from './entities.js'

const PostEntity = entity<Post>('post')
const PostKey = queryKey<[id: number], Post | null>('post')
const PostsKey = queryKey<[], PostsPage>('posts')
const PostsPagesKey = queryKey<[], InfinitePages<PostsPage, number | undefined>>('postsPages')

describe('query', () => {
  describe('settings', () => {
    describe('entities', () => {
      beforeEach(() => {
        resetMockData()
      })

      it('should work with query', async () => {
        const {
          query,
          $data
        } = client()
        const firstPostKey = PostEntity(1)
        const $postId = signal(1)
        const [$post] = query(PostKey, [$postId], getPost, [
          entities(PostEntity)
        ])
        const [$posts] = query(PostsKey, [], getPosts, [
          entities((capture, postsPage) => ({
            ...postsPage,
            posts: postsPage.posts.map(capture(PostEntity))
          }))
        ])
        const offPost = effect(() => {
          $post()
        })
        const firstPostData = {
          id: 1,
          title: 'First Post',
          content: 'Hello World!'
        }

        await waitTasks($post)

        expect($post()).toEqual(firstPostData)
        expect($data(firstPostKey)).toEqual(firstPostData)

        await updatePost(1, {
          title: 'Updated First Post',
          content: 'Updated Content'
        })

        const updatedFirstPostData = {
          id: 1,
          title: 'Updated First Post',
          content: 'Updated Content'
        }

        expect($post()).toEqual(firstPostData)
        expect($data(firstPostKey)).toEqual(firstPostData)

        const offPosts = effect(() => {
          $posts()
        })

        await waitTasks($posts)

        expect($posts()!.posts[0]).toEqual(updatedFirstPostData)
        expect($data(firstPostKey)).toEqual(updatedFirstPostData)
        expect($post()).toEqual(updatedFirstPostData)

        $data(firstPostKey, post => post && {
          ...post,
          title: 'Directly Updated First Post'
        })

        const directlyUpdatedFirstPostData = {
          id: 1,
          title: 'Directly Updated First Post',
          content: 'Updated Content'
        }

        expect($posts()!.posts[0]).toEqual(directlyUpdatedFirstPostData)
        expect($data(firstPostKey)).toEqual(directlyUpdatedFirstPostData)
        expect($post()).toEqual(directlyUpdatedFirstPostData)

        offPost()
        offPosts()
      })

      it('should work with mutation', async () => {
        const {
          query,
          mutation,
          $data
        } = client(mutations())
        const firstPostKey = PostEntity(1)
        const $postId = signal(1)
        const [$post] = query(PostKey, [$postId], getPost, [
          entities(PostEntity)
        ])
        const [mutate, $mutatedPost] = mutation(
          (id: number, title: string, content: string) => updatePost(id, {
            title,
            content
          }),
          [entities(PostEntity)]
        )
        const offPost = effect(() => {
          $post()
        })
        const firstPostData = {
          id: 1,
          title: 'First Post',
          content: 'Hello World!'
        }

        await waitTasks($post)

        expect($post()).toEqual(firstPostData)
        expect($data(firstPostKey)).toEqual(firstPostData)

        await mutate(1, 'Mutated First Post', 'Mutated Content')

        const mutatedFirstPostData = {
          id: 1,
          title: 'Mutated First Post',
          content: 'Mutated Content'
        }

        expect($mutatedPost()).toEqual(mutatedFirstPostData)
        expect($data(firstPostKey)).toEqual(mutatedFirstPostData)
        expect($post()).toEqual(mutatedFirstPostData)

        offPost()
      })

      it('should work with optimistic mutation', async () => {
        const {
          query,
          mutation,
          $data
        } = client(mutations())
        const firstPostKey = PostEntity(1)
        const [$posts] = query(PostsKey, [], getPosts, [
          entities((capture, postsPage) => ({
            ...postsPage,
            posts: postsPage.posts.map(capture(PostEntity))
          }))
        ])
        const [mutate] = mutation<[id: number, title: string, content: string], Post | null>(
          (id, title, content, ctx) => {
            const previousPost = $data(PostEntity(id))

            if (previousPost) {
              $data(PostEntity(id), {
                ...previousPost,
                title,
                content
              })

              onError(ctx, () => {
                $data(PostEntity(id), previousPost)
              })
            }

            return updatePost(id, {
              title,
              content
            })
          }
        )
        const offPost = effect(() => {
          $posts()
        })
        const firstPostData = {
          id: 1,
          title: 'First Post',
          content: 'Hello World!'
        }

        await waitTasks($posts)

        expect($posts()!.posts[0]).toEqual(firstPostData)
        expect($data(firstPostKey)).toEqual(firstPostData)

        const promise = mutate(1, 'Mutated First Post', 'Mutated Content')
        const mutatedFirstPostData = {
          id: 1,
          title: 'Mutated First Post',
          content: 'Mutated Content'
        }

        expect($data(firstPostKey)).toEqual(mutatedFirstPostData)
        expect($posts()!.posts[0]).toEqual(mutatedFirstPostData)

        await promise

        expect($data(firstPostKey)).toEqual(mutatedFirstPostData)
        expect($posts()!.posts[0]).toEqual(mutatedFirstPostData)

        offPost()
      })

      it('should deref manual added cached data', async () => {
        const {
          query,
          $data
        } = client(mutations())
        const [$posts] = query(PostsKey, [], getPosts, [
          entities((capture, postsPage) => ({
            ...postsPage,
            posts: postsPage.posts.map(capture(PostEntity))
          }))
        ])
        const offPost = effect(() => {
          $posts()
        })

        await waitTasks($posts)

        expect($posts()?.posts.length).toBe(2)

        const newPost = {
          id: 4,
          title: 'Fourth Post',
          content: 'Fourth Content'
        }

        $data(PostsKey, postsPage => postsPage && {
          ...postsPage,
          posts: prepend(postsPage.posts, newPost)
        })

        expect($posts()?.posts.length).toBe(3)
        expect($posts()?.posts[0]).toEqual(newPost)

        $data(PostEntity(4), {
          ...newPost,
          title: 'Fourth Post Updated'
        })

        expect($posts()?.posts[0]).toMatchObject({
          id: 4,
          title: 'Fourth Post Updated',
          content: 'Fourth Content'
        })

        offPost()
      })

      it('should keep entity updates when the next page loads', async () => {
        const {
          infinite,
          $data
        } = client(infinites())
        const [fetchNext, $pages] = infinite(
          PostsPagesKey,
          [],
          page => page.nextCursor,
          getPosts,
          [
            entities((capture, pages) => mapPages(pages, page => ({
              ...page,
              posts: page.posts.map(capture(PostEntity))
            })))
          ]
        )
        const off = effect(() => {
          $pages()
        })

        await waitTasks($pages)

        $data(PostEntity(1), post => post && {
          ...post,
          title: 'Directly Updated First Post'
        })

        await fetchNext()

        expect($data(PostEntity(1))?.title).toBe('Directly Updated First Post')
        expect($pages()?.pages[0]?.posts[0]?.title).toBe('Directly Updated First Post')

        off()
      })

      describe('with an entity id from the parameters', () => {
        const createdPost = {
          id: 4,
          title: 'Fourth Post',
          content: 'Fourth Content'
        }

        it('should show the entity while the query has no data of its own', () => {
          const {
            query,
            $data
          } = client()
          const [$post, , $loading] = query(PostKey, [4], () => new Promise<Post | null>(() => {}), [
            entities(PostEntity, (params) => {
              expectTypeOf(params).toEqualTypeOf<Partial<[id: number]>>()

              return params[0]
            })
          ])
          const off = effect(() => {
            $post()
          })

          $data(PostEntity(createdPost), createdPost)

          expect($post()).toEqual(createdPost)
          expect($loading()).toBe(true)

          off()
        })

        it('should follow updates of the entity while the query loads', () => {
          const {
            query,
            $data
          } = client()
          const [$post] = query(PostKey, [4], () => new Promise<Post | null>(() => {}), [
            entities(PostEntity, ([id]) => id)
          ])
          const off = effect(() => {
            $post()
          })

          $data(PostEntity(createdPost), createdPost)
          $data(PostEntity(4), post => post && {
            ...post,
            title: 'Fourth Post Updated'
          })

          expect($post()?.title).toBe('Fourth Post Updated')

          off()
        })

        it('should give way to the data of the query once it comes', async () => {
          const {
            query,
            $data
          } = client()
          const [$post] = query(PostKey, [1], getPost, [
            entities(PostEntity, ([id]) => id)
          ])

          $data(PostEntity(1), {
            id: 1,
            title: 'Stale First Post',
            content: 'Hello World!'
          })

          const off = effect(() => {
            $post()
          })

          expect($post()?.title).toBe('Stale First Post')

          await waitTasks($post)

          expect($post()?.title).toBe('First Post')

          off()
        })

        it('should keep showing the entity after the request of the query fails', async () => {
          const {
            query,
            $data
          } = client()
          const [$post, $error] = query(PostKey, [4], () => Promise.reject(new Error('Not found')), [
            entities(PostEntity, ([id]) => id)
          ])

          $data(PostEntity(createdPost), createdPost)

          const off = effect(() => {
            $post()
          })

          await waitTasks($post).catch(() => {})

          expect($error()).toBe('Not found')
          expect($post()).toEqual(createdPost)

          off()
        })

        it('should give no data while a required parameter has no value', () => {
          const {
            query,
            $data
          } = client()
          const $postId = signal<number | undefined>(undefined)
          const [$post, , $loading] = query(PostKey, [required($postId)], getPost, [
            entities(PostEntity, ([id]) => id)
          ])
          const off = effect(() => {
            $post()
          })

          $data(PostEntity(createdPost), createdPost)

          expect($post()).toBeNull()
          expect($loading()).toBe(false)

          off()
        })
      })
    })
  })
})
