import {
  describe,
  it,
  expect
} from 'vitest'
import {
  removeTrailingSlash,
  parseHref,
  parseInitialHref,
  getHref,
  updateHrefObject,
  updateHref
} from './utils.js'

describe('router', () => {
  describe('utils', () => {
    describe('removeTrailingSlash', () => {
      it('should remove trailing slash from path', () => {
        expect(removeTrailingSlash('/path/')).toBe('/path')
        expect(removeTrailingSlash('/nested/path/')).toBe('/nested/path')
      })

      it('should remove trailing slash before query parameters', () => {
        expect(removeTrailingSlash('/path/?query=value')).toBe('/path?query=value')
        expect(removeTrailingSlash('/nested/path/?a=1&b=2')).toBe('/nested/path?a=1&b=2')
      })

      it('should not modify paths without trailing slash', () => {
        expect(removeTrailingSlash('/path')).toBe('/path')
        expect(removeTrailingSlash('/nested/path')).toBe('/nested/path')
        expect(removeTrailingSlash('/path?query=value')).toBe('/path?query=value')
      })

      it('should not remove single slash (root)', () => {
        expect(removeTrailingSlash('/')).toBe('/')
      })
    })

    describe('parseHref', () => {
      it('should parse relative href', () => {
        const result = parseHref('/path/to/page?query=value#section')

        expect(result.pathname).toBe('/path/to/page')
        expect(result.search).toBe('?query=value')
        expect(result.hash).toBe('#section')
      })

      it('should parse absolute href', () => {
        const result = parseHref('https://example.com/path?query=value#section')

        expect(result.pathname).toBe('/path')
        expect(result.search).toBe('?query=value')
        expect(result.hash).toBe('#section')
      })

      it('should handle href without query or hash', () => {
        const result = parseHref('/simple/path')

        expect(result.pathname).toBe('/simple/path')
        expect(result.search).toBe('')
        expect(result.hash).toBe('')
      })
    })

    describe('parseInitialHref', () => {
      it('should parse a full url', () => {
        const result = parseInitialHref('https://example.com/path?query=value#section')

        expect(result.pathname).toBe('/path')
        expect(result.search).toBe('?query=value')
        expect(result.hash).toBe('#section')
      })

      it('should keep the trailing slash of a path, as the browser does', () => {
        expect(parseInitialHref('/about/').pathname).toBe('/about/')
        expect(parseInitialHref('https://example.com/about/').pathname).toBe('/about/')
      })

      it('should read a path that starts with two slashes as a path, not a host', () => {
        const result = parseInitialHref('//evil.example/admin')

        expect(result.host).toBe('a')
        expect(result.pathname).toBe('//evil.example/admin')
        expect(parseInitialHref('///').pathname).toBe('///')
        expect(parseInitialHref('//%').pathname).toBe('//%')
      })

      it('should read a broken absolute url into a path', () => {
        expect(parseInitialHref('http://x:99999/').pathname).toBe('//x:99999/')
      })
    })

    describe('getHref', () => {
      it('should construct href from location object', () => {
        const location = {
          pathname: '/path/to/page',
          search: '?query=value',
          hash: '#section'
        }

        expect(getHref(location)).toBe('/path/to/page?query=value#section')
      })

      it('should handle empty search and hash', () => {
        const location = {
          pathname: '/path',
          search: '',
          hash: ''
        }

        expect(getHref(location)).toBe('/path')
      })

      it('should remove trailing slash', () => {
        const location = {
          pathname: '/path/',
          search: '?query=value',
          hash: ''
        }

        expect(getHref(location)).toBe('/path?query=value')
      })

      it('should keep a pathname that the browser reads as another host a path of the current origin', () => {
        expect(getHref({
          pathname: '//evil.example/page',
          search: '?query=value',
          hash: ''
        })).toBe('/evil.example/page?query=value')
        expect(getHref({
          pathname: '/\\evil.example/page',
          search: '',
          hash: ''
        })).toBe('/evil.example/page')
      })

      it('should keep a pathname that is a url of its own scheme a path of the current origin', () => {
        expect(getHref({
          pathname: 'https://evil.example/page',
          search: '',
          hash: ''
        })).toBe('/https://evil.example/page')
        expect(getHref({
          // The URL parser gives such a pathname for `x:javascript:alert(1)`
          // oxlint-disable-next-line eslint/no-script-url
          pathname: 'javascript:alert(1)',
          search: '',
          hash: ''
        })).toBe('/javascript:alert(1)')
      })
    })

    describe('updateHrefObject', () => {
      const baseHref = {
        pathname: '/original',
        search: '?original=value',
        hash: '#original'
      }

      it('should update pathname', () => {
        const result = updateHrefObject(baseHref, {
          pathname: '/updated'
        })

        expect(result.pathname).toBe('/updated')
        expect(result.search).toBe('?original=value')
        expect(result.hash).toBe('#original')
        expect(result.href).toBe('/updated?original=value#original')
      })

      it('should update search', () => {
        const result = updateHrefObject(baseHref, {
          search: '?updated=value'
        })

        expect(result.pathname).toBe('/original')
        expect(result.search).toBe('?updated=value')
        expect(result.hash).toBe('#original')
        expect(result.href).toBe('/original?updated=value#original')
      })

      it('should update hash', () => {
        const result = updateHrefObject(baseHref, {
          hash: '#updated'
        })

        expect(result.pathname).toBe('/original')
        expect(result.search).toBe('?original=value')
        expect(result.hash).toBe('#updated')
        expect(result.href).toBe('/original?original=value#updated')
      })

      it('should update with searchParams', () => {
        const searchParams = new URLSearchParams()

        searchParams.set('param1', 'value1')
        searchParams.set('param2', 'value2')

        const result = updateHrefObject(baseHref, {
          searchParams
        })

        expect(result.search).toBe('?param1=value1&param2=value2')
        expect(result.href).toBe('/original?param1=value1&param2=value2#original')
      })

      it('should update multiple properties', () => {
        const result = updateHrefObject(baseHref, {
          pathname: '/new',
          search: '?new=param',
          hash: '#new'
        })

        expect(result.pathname).toBe('/new')
        expect(result.search).toBe('?new=param')
        expect(result.hash).toBe('#new')
        expect(result.href).toBe('/new?new=param#new')
      })

      it('should keep the href on the current origin whatever the update string resolves to', () => {
        expect(updateHrefObject(baseHref, '/.//x//evil.example/page').href).toBe('/evil.example/page')
        expect(updateHrefObject(baseHref, 'x:x:https://evil.example/page').href).toBe('/https://evil.example/page')
        expect(updateHrefObject(baseHref, 'a:b:javascript:alert(1)').href).toBe('/javascript:alert(1)')
      })

      it('should keep the href on the current origin whatever the pathname resolves to', () => {
        expect(updateHrefObject(baseHref, {
          pathname: '/posts/..//evil.example'
        }).href).toBe('/evil.example?original=value#original')
        expect(updateHrefObject(baseHref, {
          pathname: 'x:https://evil.example'
        }).href).toBe('/https://evil.example?original=value#original')
      })
    })

    describe('updateHref', () => {
      it('should update href string with pathname', () => {
        const result = updateHref('/original?query=value#hash', {
          pathname: '/updated'
        })

        expect(result).toBe('/updated?query=value#hash')
      })

      it('should update href string with search', () => {
        const result = updateHref('/path?original=value#hash', {
          search: '?updated=value'
        })

        expect(result).toBe('/path?updated=value#hash')
      })

      it('should update href string with hash', () => {
        const result = updateHref('/path?query=value#original', {
          hash: '#updated'
        })

        expect(result).toBe('/path?query=value#updated')
      })

      it('should update href string with searchParams', () => {
        const searchParams = new URLSearchParams()

        searchParams.set('new', 'param')

        const result = updateHref('/path?old=value#hash', {
          searchParams
        })

        expect(result).toBe('/path?new=param#hash')
      })
    })
  })
})
