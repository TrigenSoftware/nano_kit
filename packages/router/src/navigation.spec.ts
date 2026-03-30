import {
  beforeEach,
  describe,
  it,
  expect
} from 'vitest'
import {
  browserNavigation,
  virtualNavigation
} from './navigation.js'

describe('router', () => {
  describe('navigation', () => {
    describe('match', () => {
      it('should match simple routes', () => {
        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          about: '/about',
          contact: '/contact'
        })

        navigation.push('/home')
        expect($location()).toMatchObject({
          route: 'home',
          params: {}
        })

        navigation.push('/about')
        expect($location()).toMatchObject({
          route: 'about',
          params: {}
        })

        navigation.push('/contact')
        expect($location()).toMatchObject({
          route: 'contact',
          params: {}
        })
      })

      it('should match routes with parameters', () => {
        const [$location, navigation] = virtualNavigation('/', {
          user: '/users/:id',
          userEdit: '/users/:id/edit',
          post: '/posts/:postId'
        })

        navigation.push('/users/123')
        expect($location()).toMatchObject({
          route: 'user',
          params: {
            id: '123'
          }
        })

        navigation.push('/users/456/edit')
        expect($location()).toMatchObject({
          route: 'userEdit',
          params: {
            id: '456'
          }
        })

        navigation.push('/posts/abc-def')
        expect($location()).toMatchObject({
          route: 'post',
          params: {
            postId: 'abc-def'
          }
        })
      })

      it('should match routes with optional parameters', () => {
        const [$location, navigation] = virtualNavigation('/', {
          blog: '/blog/:page?',
          category: '/blog/category/:slug/:page?'
        })

        navigation.push('/blog')
        expect($location()).toMatchObject({
          route: 'blog',
          params: {
            page: ''
          }
        })

        navigation.push('/blog/2')
        expect($location()).toMatchObject({
          route: 'blog',
          params: {
            page: '2'
          }
        })

        navigation.push('/blog/category/tech')
        expect($location()).toMatchObject({
          route: 'category',
          params: {
            slug: 'tech',
            page: ''
          }
        })

        navigation.push('/blog/category/tech/3')
        expect($location()).toMatchObject({
          route: 'category',
          params: {
            slug: 'tech',
            page: '3'
          }
        })
      })

      it('should match splat routes', () => {
        const [$location, navigation] = virtualNavigation('/', {
          files: '/files/*',
          api: '/api/*'
        })

        navigation.push('/files/documents/report.pdf')
        expect($location()).toMatchObject({
          route: 'files',
          params: {
            splat: 'documents/report.pdf'
          }
        })

        navigation.push('/api/v1/users/123')
        expect($location()).toMatchObject({
          route: 'api',
          params: {
            splat: 'v1/users/123'
          }
        })
      })

      it('should handle URL encoding in parameters', () => {
        const [$location, navigation] = virtualNavigation('/', {
          search: '/search/:query'
        })

        navigation.push('/search/hello%20world')
        expect($location()).toMatchObject({
          route: 'search',
          params: {
            query: 'hello world'
          }
        })

        navigation.push('/search/special%2Bchars%26symbols')
        expect($location()).toMatchObject({
          route: 'search',
          params: {
            query: 'special+chars&symbols'
          }
        })
      })

      it('should handle special characters in route patterns', () => {
        const [$location, navigation] = virtualNavigation('/', {
          apiV1: '/api/v1.0/:endpoint',
          brackets: '/data[test]/:id',
          special: '/path+with+plus/:param'
        })

        navigation.push('/api/v1.0/test')
        expect($location()).toMatchObject({
          route: 'apiV1',
          params: {
            endpoint: 'test'
          }
        })

        navigation.push('/data[test]/123')
        expect($location()).toMatchObject({
          route: 'brackets',
          params: {
            id: '123'
          }
        })

        navigation.push('/path+with+plus/value')
        expect($location()).toMatchObject({
          route: 'special',
          params: {
            param: 'value'
          }
        })
      })

      it('should handle trailing slashes correctly', () => {
        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          users: '/users/'
        })

        navigation.push('/home/')
        expect($location()).toMatchObject({
          route: 'home',
          params: {}
        })

        navigation.push('/users')
        expect($location()).toMatchObject({
          route: 'users',
          params: {}
        })

        navigation.push('/users/')
        expect($location()).toMatchObject({
          route: 'users',
          params: {}
        })
      })

      it('should handle root path', () => {
        const [$location] = virtualNavigation('/', {
          home: '/',
          about: '/about'
        })

        expect($location()).toMatchObject({
          route: 'home',
          params: {}
        })
      })

      it('should return nomatch when no route matches', () => {
        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          about: '/about'
        })

        navigation.push('/unknown-path')
        expect($location()).toMatchObject({
          route: null,
          params: {}
        })
      })

      it('should be case insensitive', () => {
        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          about: '/about'
        })

        navigation.push('/HOME')
        expect($location()).toMatchObject({
          route: 'home',
          params: {}
        })

        navigation.push('/ABOUT')
        expect($location()).toMatchObject({
          route: 'about',
          params: {}
        })
      })

      it('should prioritize exact matches over parameterized routes', () => {
        const [$location, navigation] = virtualNavigation('/', {
          userNew: '/users/new',
          user: '/users/:id'
        })

        navigation.push('/users/new')
        expect($location()).toMatchObject({
          route: 'userNew',
          params: {}
        })
      })

      it('should handle complex nested routes', () => {
        const [$location, navigation] = virtualNavigation('/', {
          adminUserPermission: '/admin/users/:userId/permissions/:permission',
          adminUser: '/admin/users/:id',
          admin: '/admin'
        })

        navigation.push('/admin/users/123/permissions/read')
        expect($location()).toMatchObject({
          route: 'adminUserPermission',
          params: {
            userId: '123',
            permission: 'read'
          }
        })
      })

      it('should update when pathname changes', () => {
        const [$location, navigation] = virtualNavigation('/', {
          home: '/home',
          about: '/about'
        })

        navigation.push('/home')
        expect($location()).toMatchObject({
          route: 'home',
          params: {}
        })

        navigation.push('/about')
        expect($location()).toMatchObject({
          route: 'about',
          params: {}
        })
      })

      it('should handle trailing slash', () => {
        location.pathname = '/about/'

        const [$location] = browserNavigation({
          home: '/home',
          about: '/about',
          contact: '/contact'
        })

        expect($location()).toMatchObject({
          route: 'about',
          params: {}
        })
      })
    })

    describe('navigation', () => {
      beforeEach(() => {
        window.history.replaceState(null, '', '/')
      })

      describe('browserRouter', () => {
        it('should handle location state correctly', () => {
          window.history.replaceState(null, '', '/test?param=value#section')

          const [$location] = browserNavigation()
          const { $pathname, $search, $hash, $href } = $location

          expect($location()).toEqual({
            pathname: '/test',
            search: '?param=value',
            hash: '#section',
            href: '/test?param=value#section',
            action: null,
            route: null,
            params: {}
          })
          expect($pathname()).toBe('/test')
          expect($search()).toBe('?param=value')
          expect($hash()).toBe('#section')
          expect($href()).toBe('/test?param=value#section')
        })

        it('should push new state', () => {
          window.history.replaceState(null, '', '/current')

          const [$location, navigation] = browserNavigation()

          navigation.push('/new-path')

          expect($location.$href()).toBe('/new-path')
          expect(window.location.pathname).toBe('/new-path')
        })

        it('should not push new state when href is same', () => {
          window.history.replaceState(null, '', '/same')

          const lengthBefore = window.history.length
          const [, navigation] = browserNavigation()

          navigation.push('/same')

          expect(window.history.length).toBe(lengthBefore)
        })

        it('should push state with navigation update object', () => {
          window.history.replaceState(null, '', '/current?old=value#old')

          const [$location, navigation] = browserNavigation()

          navigation.push({
            pathname: '/new',
            search: '?new=value'
          })

          expect($location.$href()).toBe('/new?new=value#old')
          expect(window.location.pathname).toBe('/new')
          expect(window.location.search).toBe('?new=value')
          expect(window.location.hash).toBe('#old')
        })

        it('should replace state when href changes', () => {
          window.history.replaceState(null, '', '/current')

          const lengthBefore = window.history.length
          const [$location, navigation] = browserNavigation()

          navigation.replace('/replaced')

          expect(lengthBefore).toBe(window.history.length)
          expect($location.$href()).toBe('/replaced')
          expect(window.location.pathname).toBe('/replaced')
        })

        it('should not replace state when href is same', () => {
          window.history.replaceState(null, '', '/same')

          const [$location, navigation] = browserNavigation()
          const locationBefore = $location()

          navigation.replace('/same')

          expect($location()).toBe(locationBefore)
        })

        it('should replace state with navigation update object', () => {
          window.history.replaceState(null, '', '/current?old=value#old')

          const lengthBefore = window.history.length
          const [$location, navigation] = browserNavigation()

          navigation.replace({
            pathname: '/replaced',
            hash: '#new'
          })

          expect(lengthBefore).toBe(window.history.length)
          expect($location.$href()).toBe('/replaced?old=value#new')
          expect(window.location.pathname).toBe('/replaced')
          expect(window.location.search).toBe('?old=value')
          expect(window.location.hash).toBe('#new')
        })

        it('should remove trailing slash from pushed paths', () => {
          window.history.replaceState(null, '', '/current')

          const [$location, navigation] = browserNavigation()

          navigation.push('/new-path/')

          expect($location.$href()).toBe('/new-path')
          expect(window.location.pathname).toBe('/new-path')
        })

        it('should handle search params in navigation update', () => {
          window.history.replaceState(null, '', '/current')

          const [$location, navigation] = browserNavigation()
          const searchParams = new URLSearchParams()

          searchParams.set('param1', 'value1')
          searchParams.set('param2', 'value2')

          navigation.push({
            searchParams
          })

          expect($location.$href()).toBe('/current?param1=value1&param2=value2')
          expect(window.location.pathname).toBe('/current')
          expect(window.location.search).toBe('?param1=value1&param2=value2')
        })

        it('should update location signals when navigating', () => {
          const [$location, navigation] = browserNavigation()
          const { $pathname, $search } = $location

          expect($pathname()).toBe('/')
          expect($search()).toBe('')

          navigation.push('/new-path?param=value')

          expect($pathname()).toBe('/new-path')
          expect($search()).toBe('?param=value')
        })
      })

      describe('virtualRouter', () => {
        it('should handle initial virtual state correctly', () => {
          const [$location] = virtualNavigation()
          const { $pathname, $search, $hash, $href } = $location

          expect($location()).toEqual({
            pathname: '/',
            search: '',
            hash: '',
            href: '/',
            action: null,
            route: null,
            params: {}
          })
          expect($pathname()).toBe('/')
          expect($search()).toBe('')
          expect($hash()).toBe('')
          expect($href()).toBe('/')
        })

        it('should push new virtual state', () => {
          const [$location, navigation] = virtualNavigation()

          navigation.push('/virt-path')

          expect($location.$href()).toBe('/virt-path')
          expect($location().action).toBe('push')
          // Window URL is not affected by virtual navigation
          expect(window.location.pathname).toBe('/')
        })

        it('should not push when href is same', () => {
          const [$location, navigation] = virtualNavigation()
          const before = $location()

          navigation.push('/')

          expect($location()).toBe(before)
        })

        it('should push with navigation update object', () => {
          const [$location, navigation] = virtualNavigation()

          navigation.replace('/current?old=value#old')
          navigation.push({
            pathname: '/new',
            search: '?new=value'
          })

          expect($location.$href()).toBe('/new?new=value#old')
          expect($location().pathname).toBe('/new')
          expect($location().search).toBe('?new=value')
          expect($location().hash).toBe('#old')
          expect($location().action).toBe('push')
        })

        it('should replace state when href changes', () => {
          const [$location, navigation] = virtualNavigation()

          navigation.push('/first')
          navigation.replace('/replaced')

          expect($location.$href()).toBe('/replaced')
          expect($location().action).toBe('replace')
        })

        it('should not replace when href is same', () => {
          const [$location, navigation] = virtualNavigation()
          const snapshot = $location()

          navigation.replace('/')

          expect($location()).toBe(snapshot)
        })

        it('should remove trailing slash from pushed paths', () => {
          const [$location, navigation] = virtualNavigation()

          navigation.push('/new-path/')

          expect($location.$href()).toBe('/new-path')
          expect($location().pathname).toBe('/new-path')
          expect($location().action).toBe('push')
        })

        it('should handle search params in navigation update', () => {
          const [$location, navigation] = virtualNavigation()
          const searchParams = new URLSearchParams()

          searchParams.set('param1', 'value1')
          searchParams.set('param2', 'value2')

          navigation.push({
            searchParams
          })

          expect($location.$href()).toBe('/?param1=value1&param2=value2')
          expect($location().pathname).toBe('/')
          expect($location().search).toBe('?param1=value1&param2=value2')
          expect($location().action).toBe('push')
        })

        it('should update virtual location signals when navigating', () => {
          const [$location, navigation] = virtualNavigation()
          const { $pathname, $search } = $location

          expect($pathname()).toBe('/')
          expect($search()).toBe('')

          navigation.push('/new-path?param=value')

          expect($pathname()).toBe('/new-path')
          expect($search()).toBe('?param=value')
        })

        it('should handle virtual history navigation methods', () => {
          const [$location, navigation] = virtualNavigation()

          navigation.push('/a')
          navigation.push('/b')
          navigation.push('/c')

          navigation.back()
          expect($location.$href()).toBe('/b')

          navigation.back()
          expect($location.$href()).toBe('/a')

          navigation.forward()
          expect($location.$href()).toBe('/b')
        })
      })
    })
  })
})
