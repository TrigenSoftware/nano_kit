import {
  describe,
  it,
  expect
} from 'vitest'
import { buildPaths } from './paths.js'

describe('router', () => {
  describe('buildPaths', () => {
    it('should return static strings for routes without parameters', () => {
      const routes = {
        home: '/',
        about: '/about',
        contact: '/contact'
      } as const
      const paths = buildPaths(routes)

      expect(paths.home).toBe('/')
      expect(paths.about).toBe('/about')
      expect(paths.contact).toBe('/contact')
    })

    it('should remove trailing slashes from static routes', () => {
      const routes = {
        home: '/',
        users: '/users/',
        docs: '/docs/'
      } as const
      const paths = buildPaths(routes)

      expect(paths.home).toBe('/')
      expect(paths.users).toBe('/users')
      expect(paths.docs).toBe('/docs')
    })

    it('should return functions for routes with required parameters', () => {
      const routes = {
        user: '/users/:id',
        post: '/posts/:slug',
        category: '/categories/:cat/posts/:id'
      } as const
      const paths = buildPaths(routes)

      expect(typeof paths.user).toBe('function')
      expect(typeof paths.post).toBe('function')
      expect(typeof paths.category).toBe('function')

      expect(paths.user({
        id: '123'
      })).toBe('/users/123')
      expect(paths.post({
        slug: 'hello-world'
      })).toBe('/posts/hello-world')
      expect(paths.category({
        cat: 'tech',
        id: 'react-tips'
      })).toBe('/categories/tech/posts/react-tips')
    })

    it('should return functions for routes with optional parameters', () => {
      const routes = {
        blog: '/blog/:page?',
        search: '/search/:query/:page?'
      } as const
      const paths = buildPaths(routes)

      expect(typeof paths.blog).toBe('function')
      expect(typeof paths.search).toBe('function')

      // With optional parameter
      expect(paths.blog({
        page: '2'
      })).toBe('/blog/2')
      expect(paths.search({
        query: 'react',
        page: '3'
      })).toBe('/search/react/3')

      // Without optional parameter
      expect(paths.blog()).toBe('/blog')
      expect(paths.search({
        query: 'react'
      })).toBe('/search/react')
    })

    it('should handle splat routes', () => {
      const routes = {
        files: '/files/*',
        api: '/api/v1/*'
      } as const
      const paths = buildPaths(routes)

      expect(typeof paths.files).toBe('function')
      expect(typeof paths.api).toBe('function')

      expect(paths.files({
        splat: 'documents/report.pdf'
      })).toBe('/files/documents/report.pdf')
      expect(paths.api({
        splat: 'users/123/profile'
      })).toBe('/api/v1/users/123/profile')

      // Without splat parameter
      expect(paths.files({
        splat: ''
      })).toBe('/files')
      expect(paths.api({
        splat: ''
      })).toBe('/api/v1')
    })

    it('should handle URL encoding in parameters', () => {
      const routes = {
        search: '/search/:query',
        file: '/files/:path'
      } as const
      const paths = buildPaths(routes)

      expect(paths.search({
        query: 'hello world'
      })).toBe('/search/hello%20world')
      expect(paths.file({
        path: 'docs/file name.pdf'
      })).toBe('/files/docs%2Ffile%20name.pdf')
      expect(paths.search({
        query: 'special+chars&symbols'
      })).toBe('/search/special%2Bchars%26symbols')
    })

    it('should handle mixed route types', () => {
      const routes = {
        home: '/',
        users: '/users/',
        user: '/users/:id',
        userPosts: '/users/:id/posts/:slug?',
        files: '/files/*',
        api: '/api/v1/*'
      } as const
      const paths = buildPaths(routes)

      // Static routes
      expect(paths.home).toBe('/')
      expect(paths.users).toBe('/users')

      // Dynamic routes
      expect(paths.user({
        id: '123'
      })).toBe('/users/123')
      expect(paths.userPosts({
        id: '123',
        slug: 'my-post'
      })).toBe('/users/123/posts/my-post')
      expect(paths.userPosts({
        id: '123'
      })).toBe('/users/123/posts')

      // Wildcard routes
      expect(paths.files({
        splat: 'docs/readme.md'
      })).toBe('/files/docs/readme.md')
      expect(paths.api({
        splat: 'users'
      })).toBe('/api/v1/users')
    })

    it('should handle complex nested parameters', () => {
      const routes = {
        admin: '/admin/users/:userId/permissions/:permission',
        nested: '/a/:param1/b/:param2/c/:param3'
      } as const
      const paths = buildPaths(routes)

      expect(paths.admin({
        userId: '123',
        permission: 'read'
      })).toBe('/admin/users/123/permissions/read')

      expect(paths.nested({
        param1: 'value1',
        param2: 'value2',
        param3: 'value3'
      })).toBe('/a/value1/b/value2/c/value3')
    })

    it('should handle special characters in route patterns', () => {
      const routes = {
        api: '/api/v1.0/:endpoint',
        data: '/data[test]/:id'
      } as const
      const paths = buildPaths(routes)

      expect(paths.api({
        endpoint: 'users'
      })).toBe('/api/v1.0/users')
      expect(paths.data({
        id: '123'
      })).toBe('/data[test]/123')
    })

    it('should handle empty string parameters', () => {
      const routes = {
        search: '/search/:query',
        optional: '/page/:slug?'
      } as const
      const paths = buildPaths(routes)

      expect(paths.search({
        query: ''
      })).toBe('/search/')
      expect(paths.optional({
        slug: ''
      })).toBe('/page/')
    })

    it('should handle multiple optional parameters', () => {
      const routes = {
        blog: '/blog/:category?/:page?',
        complex: '/path/:a?/:b?/:c?'
      } as const
      const paths = buildPaths(routes)

      expect(paths.blog({})).toBe('/blog')
      expect(paths.blog({
        category: 'tech'
      })).toBe('/blog/tech')
      expect(paths.blog({
        category: 'tech',
        page: '2'
      })).toBe('/blog/tech/2')

      expect(paths.complex({})).toBe('/path')
      expect(paths.complex({
        a: '1'
      })).toBe('/path/1')
      expect(paths.complex({
        a: '1',
        b: '2'
      })).toBe('/path/1/2')
      expect(paths.complex({
        a: '1',
        b: '2',
        c: '3'
      })).toBe('/path/1/2/3')
    })

    it('should preserve path structure for partial parameters', () => {
      const routes = {
        user: '/users/:id/profile/:section?'
      } as const
      const paths = buildPaths(routes)

      expect(paths.user({
        id: '123'
      })).toBe('/users/123/profile')
      expect(paths.user({
        id: '123',
        section: 'settings'
      })).toBe('/users/123/profile/settings')
    })
  })
})
