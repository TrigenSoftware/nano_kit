import {
  describe,
  it,
  expect,
  beforeEach
} from 'vitest'
import {
  type TasksPool,
  effect,
  signal,
  tasksRunner,
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
import { tasks } from '../ClientContext.js'
import { onError } from '../RequestContext.js'
import {
  client,
  mutations
} from '../client.js'
import { queryKey } from '../cache.js'
import {
  entity,
  entities
} from './entities.js'

const PostEntity = entity<Post>('post')
const PostKey = queryKey<[id: number], Post | null>('post')
const PostsKey = queryKey<[], PostsPage>('posts')

describe('query', () => {
  describe('settings', () => {
    describe('entities', () => {
      const tasksPool: TasksPool = new Set()

      beforeEach(() => {
        tasksPool.clear()
        resetMockData()
      })

      it('should work with query', async () => {
        const {
          query,
          $data
        } = client(
          tasks(tasksRunner(tasksPool))
        )
        const firstPostKey = PostEntity(1)
        const $postId = signal(1)
        const [$post] = query(PostKey, [$postId], getPost, [
          entities(PostEntity)
        ])
        const [$posts] = query(PostsKey, [], getPosts, [
          entities(postsPage => ({
            ...postsPage,
            posts: postsPage.posts.map(PostEntity)
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

        await waitTasks(tasksPool)

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

        await waitTasks(tasksPool)

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
        } = client(
          mutations(),
          tasks(tasksRunner(tasksPool))
        )
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

        await waitTasks(tasksPool)

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
        } = client(
          mutations(),
          tasks(tasksRunner(tasksPool))
        )
        const firstPostKey = PostEntity(1)
        const [$posts] = query(PostsKey, [], getPosts, [
          entities(postsPage => ({
            ...postsPage,
            posts: postsPage.posts.map(PostEntity)
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

        await waitTasks(tasksPool)

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
    })
  })
})
