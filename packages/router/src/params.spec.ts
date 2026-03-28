import {
  describe,
  it,
  expect
} from 'vitest'
import { virtualNavigation } from './navigation.js'
import {
  searchParams,
  searchParam,
  param,
  forRoute
} from './params.js'

describe('router', () => {
  describe('params', () => {
    describe('param', () => {
      it('should extract and parse route parameters', () => {
        const [$location, navigation] = virtualNavigation('/', {
          user: '/users/:id/:category'
        })

        navigation.push('/users/123/tech')

        const $id = param($location, 'id')
        const $category = param($location, 'category')

        expect($id()).toBe('123')
        expect($category()).toBe('tech')
      })

      it('should parse parameter with custom parser', () => {
        const [$location, navigation] = virtualNavigation('/', {
          user: '/users/:id/:page/:active'
        })

        navigation.push('/users/123/5/true')

        const $id = param($location, 'id', Number)
        const $page = param($location, 'page', value => (!value ? 0 : parseInt(value)))
        const $active = param($location, 'active', value => value === 'true')

        expect($id()).toBe(123)
        expect($page()).toBe(5)
        expect($active()).toBe(true)
      })

      it('should handle missing parameters gracefully', () => {
        const [$location, navigation] = virtualNavigation('/', {
          user: '/users/:id'
        })

        navigation.push('/users/123')

        const $missing = param($location, 'missing' as any)

        expect($missing()).toBeUndefined()
      })

      it('should update when route changes', () => {
        const [$location, navigation] = virtualNavigation('/', {
          user: '/users/:id'
        })

        navigation.push('/users/123')

        const $id = param($location, 'id', Number)

        expect($id()).toBe(123)

        navigation.push('/users/456')
        expect($id()).toBe(456)
      })

      it('should parse with complex transformations', () => {
        const [$location, navigation] = virtualNavigation('/', {
          search: '/search/:tags'
        })

        navigation.push('/search/javascript,typescript,react')

        const $tags = param($location, 'tags', value => value?.split(',') || [])

        expect($tags()).toEqual([
          'javascript',
          'typescript',
          'react'
        ])

        navigation.push('/search/vue,angular')
        expect($tags()).toEqual(['vue', 'angular'])
      })

      it('should handle empty string parameters', () => {
        const [$location, navigation] = virtualNavigation('/', {
          page: '/page/:optional?'
        })

        navigation.push('/page')

        const $optional = param($location, 'optional')

        expect($optional()).toBe('')
      })

      it('should work with wildcard parameters', () => {
        const [$location, navigation] = virtualNavigation('/', {
          files: '/files/*'
        })

        navigation.push('/files/documents/report.pdf')

        const $wildcard = param($location, 'wildcard')

        expect($wildcard()).toBe('documents/report.pdf')
      })
    })

    describe('searchParams', () => {
      it('should return URLSearchParams and react to search changes', () => {
        const [$location, navigation] = virtualNavigation()
        const $params = searchParams($location)

        expect($params()).toBeInstanceOf(URLSearchParams)
        expect($params().toString()).toBe('')

        navigation.push('/?a=1&b=2')

        expect($params().toString()).toBe('a=1&b=2')

        navigation.replace('/?b=3')

        expect($params().toString()).toBe('b=3')
      })

      it('should not recompute when only hash or pathname changes (search unchanged)', () => {
        const [$location, navigation] = virtualNavigation()
        const $params = searchParams($location)
        const first = $params()

        navigation.push('/#hash')
        expect($params()).toBe(first)

        navigation.replace('/path#hash2')
        expect($params()).toBe(first)
      })

      it('should recompute when search string changes', () => {
        const [$location, navigation] = virtualNavigation()
        const $params = searchParams($location)
        const first = $params()

        navigation.push('/?x=1')

        const second = $params()

        expect(second).not.toBe(first)
        expect(second.get('x')).toBe('1')
      })

      describe('searchParam', () => {
        it('should react location change', () => {
          const [$location, navigation] = virtualNavigation()
          const $params = searchParams($location)
          const $a = searchParam($params, 'a')

          expect($a()).toBeNull()

          navigation.push('/?a=123')
          expect($a()).toBe('123')

          navigation.replace('/')
          expect($a()).toBeNull()
        })

        it('should parse value', () => {
          const [$location, navigation] = virtualNavigation()
          const $params = searchParams($location)
          const $n = searchParam($params, 'n', v => (v === null ? -1 : parseInt(v, 10)))

          expect($n()).toBe(-1)

          navigation.push('/?n=42')
          expect($n()).toBe(42)

          navigation.replace('/')
          expect($n()).toBe(-1)
        })
      })
    })

    describe('forRoute', () => {
      it('should preserve previous value when route changes', () => {
        const [$location, navigation] = virtualNavigation('/', {
          home: '/',
          about: '/about'
        })
        const $searchParams = searchParams($location)
        const $page = searchParam($searchParams, 'page')
        const $value = forRoute($location, 'home', $page)

        navigation.push('/?page=10')

        expect($value()).toBe('10')

        navigation.push('/about?page=20')

        expect($value()).toBe('10')

        navigation.push('/?page=30')

        expect($value()).toBe('30')
      })
    })
  })
})
