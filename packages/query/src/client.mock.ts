/* oxlint-disable typescript/require-await */
export interface Post {
  id: number
  title: string
  content: string
}

export interface PostsPage {
  posts: Post[]
  nextCursor: number | null
}

export interface CreatePostParams {
  title: string
  content: string
}

export interface UpdatePostParams {
  title?: string
  content?: string
}

// In-memory storage
let posts: Post[] = []
let nextId = 0
const PAGE_SIZE = 2

resetMockData()

export function resetMockData() {
  posts = [
    {
      id: 1,
      title: 'First Post',
      content: 'Hello World!'
    },
    {
      id: 2,
      title: 'Second Post',
      content: 'Another post content'
    },
    {
      id: 3,
      title: 'Third Post',
      content: 'Yet another post'
    }
  ]
  nextId = 4
}

export async function getPost(id: number): Promise<Post | null> {
  const post = posts.find(p => p.id === id)

  return post ?? null
}

export async function getPosts(cursor?: number | null): Promise<PostsPage> {
  const startIndex = cursor
    ? posts.findIndex(p => p.id === cursor) + 1
    : 0
  const pagePosts = posts.slice(startIndex, startIndex + PAGE_SIZE)
  const lastPost = pagePosts[pagePosts.length - 1]
  const hasMore = lastPost && posts.indexOf(lastPost) < posts.length - 1

  return {
    posts: pagePosts,
    nextCursor: hasMore ? lastPost.id : null
  }
}

export async function createPost(params: CreatePostParams): Promise<Post> {
  const post: Post = {
    id: nextId++,
    title: params.title,
    content: params.content
  }

  posts.push(post)

  return post
}

export async function updatePost(id: number, params: UpdatePostParams): Promise<Post | null> {
  const index = posts.findIndex(p => p.id === id)

  if (index === -1) {
    return null
  }

  posts[index] = {
    ...posts[index],
    ...params
  }

  return posts[index]
}

export async function deletePost(id: number): Promise<boolean> {
  const index = posts.findIndex(p => p.id === id)

  if (index === -1) {
    return false
  }

  posts.splice(index, 1)

  return true
}
