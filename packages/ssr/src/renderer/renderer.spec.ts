import {
  describe,
  it,
  expect
} from 'vitest'
import {
  InjectionContext,
  inject
} from '@nano_kit/store'
import {
  type HeadDescriptor,
  Location$,
  Navigation$,
  dir,
  lang,
  meta,
  notFound,
  page,
  title
} from '@nano_kit/router'
import type { RenderData } from './renderer.types.js'
import { renderer } from '../../test/app/renderer.js'
import { Renderer } from './renderer.js'

class PlainRenderer extends Renderer {
  renderToString() {
    return 'page'
  }
}

// Pages outside of layouts, without `Stores$` and `Head$`, a page that moves its old urls to new ones,
// and the cookie store that reads the request url too
const plainRenderer = new PlainRenderer({
  routes: {
    home: '/',
    blog: '/blog/:slug'
  },
  pages: [
    page('home', {
      default: () => 'home'
    }),
    page('blog', {
      default: () => 'blog',
      Stores$() {
        const $location = inject(Location$)
        const navigation = inject(Navigation$)
        const { slug } = $location().params as { slug: string }

        navigation.replace({
          pathname: `/posts/${slug}`
        }, true)

        return []
      }
    }),
    notFound(() => 'not found')
  ],
  compose: () => () => '',
  inject: {
    cookieStore: true
  }
})

renderer.manifest = {
  '_head-D2ODF_fA.js': {
    file: 'assets/head-D2ODF_fA.js',
    name: 'head',
    imports: [
      'app/client.js'
    ]
  },
  'app/about.js': {
    file: 'assets/about-dfrNsiL9.js',
    name: 'about',
    src: 'app/about.js',
    isDynamicEntry: true,
    imports: [
      '_head-D2ODF_fA.js',
      'app/client.js'
    ]
  },
  'app/client.js': {
    file: 'assets/client-Dfg_FsOr.js',
    name: 'client',
    src: 'app/client.js',
    isEntry: true,
    dynamicImports: [
      'app/home.js',
      'app/about.js'
    ]
  },
  'app/home.js': {
    file: 'assets/home-yocNkO-H.js',
    name: 'home',
    src: 'app/home.js',
    isDynamicEntry: true,
    imports: [
      '_head-D2ODF_fA.js',
      'app/client.js'
    ]
  }
}

plainRenderer.manifest = renderer.manifest

describe('ssr', () => {
  describe('renderer', () => {
    it('should render html', async () => {
      expect((await renderer.render('/')).html).toBe(
        '<!doctype html><html><head><title>Home Page</title><meta charset="utf-8" /><script type="module" src="/assets/client-Dfg_FsOr.js"></script></head><body><div id="app">Layout > Home John Doe</div><script>window.__DEHYDRATED__=[["data",{"user":"John Doe"}]]</script></body></html>'
      )

      expect((await renderer.render('/about')).html).toBe(
        '<!doctype html><html><head><title>About Page</title><meta charset="utf-8" /><script type="module" src="/assets/client-Dfg_FsOr.js"></script></head><body><div id="app">Layout > About Miguel loves cheese</div><script>window.__DEHYDRATED__=[["data",{"info":"Miguel loves cheese"}]]</script></body></html>'
      )
    })

    it('should respond with 200 by default', async () => {
      expect((await renderer.render('/')).statusCode).toBe(200)
    })

    it('should respond with 404 when no page matches', async () => {
      expect((await renderer.render('/nowhere')).statusCode).toBe(404)
    })

    it('should render the not found page for a path that the URL parser reads as a host', async () => {
      expect(await plainRenderer.render('///')).toMatchObject({
        statusCode: 404,
        html: '<!doctype html>page'
      })
    })

    it('should render a page without Stores$ and Head$', async () => {
      expect(await plainRenderer.render('/')).toMatchObject({
        statusCode: 200,
        html: '<!doctype html>page'
      })
    })

    it('should render a not found page that is a plain component', async () => {
      expect(await plainRenderer.render('/nowhere')).toMatchObject({
        statusCode: 404,
        html: '<!doctype html>page'
      })
    })

    it('should redirect to the path that the page builds from a parameter', async () => {
      expect(await plainRenderer.render('/blog/hello')).toMatchObject({
        statusCode: 301,
        redirect: '/posts/hello',
        html: null
      })
    })

    it('should throw on a redirect that dot segments of a parameter lead to another host', async () => {
      await expect(plainRenderer.render('/blog/..%2F%2Fevil.example')).rejects.toThrow('leads to another host')
    })

    it('should respond with the status that the page gives by its dehydrated stores', async () => {
      expect((await renderer.render('/gone')).statusCode).toBe(410)
    })

    it('should respond with the status code of the page when its StatusCode$ gives none', async () => {
      expect((await renderer.render('/teapot')).statusCode).toBe(418)
    })

    it('should escape closing script tags in the dehydrated script', () => {
      expect(renderer.dehydratedScript([
        ['html', '</script><script>alert(1)</script>']
      ])).toBe('window.__DEHYDRATED__=[["html","\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"]]')
    })

    describe('document', () => {
      function renderData(head: HeadDescriptor[]): RenderData {
        return {
          context: new InjectionContext(),
          head,
          dehydrated: [],
          statusCode: 200,
          redirect: null,
          page: null,
          setCookieHeaders: null
        }
      }

      it('should put the app into the root element followed by the dehydrated script', () => {
        expect(renderer.document(renderData([]), '<main>App</main>')).toBe(
          '<html><head></head><body><div id="app"><main>App</main></div><script>window.__DEHYDRATED__=[]</script></body></html>'
        )
      })

      it('should put lang and dir on the html element', () => {
        expect(renderer.document(renderData([lang('en'), dir('rtl')]), '')).toMatch(/^<html lang="en" dir="rtl"><head>/)
      })

      it('should put the title before the other head tags', () => {
        expect(renderer.document(renderData([
          meta({
            charSet: 'utf-8'
          }),
          title('Home')
        ]), '')).toContain('<head><title>Home</title><meta charset="utf-8" /></head>')
      })

      it('should put the given head after the head tags', () => {
        expect(renderer.document(renderData([
          title('Home')
        ]), '', '<style>main{}</style>')).toContain('<head><title>Home</title><style>main{}</style></head>')
      })

      it('should escape the title, lang and dir', () => {
        const html = renderer.document(renderData([
          lang('en" onload="x'),
          dir('rtl" onload="x' as 'rtl'),
          title('Tom & "Jerry" <3')
        ]), '')

        expect(html).toContain('<html lang="en&quot; onload=&quot;x" dir="rtl&quot; onload=&quot;x">')
        expect(html).toContain('<title>Tom &amp; &quot;Jerry&quot; &lt;3</title>')
      })

      it('should omit empty title, lang and dir', () => {
        expect(renderer.document(renderData([
          lang(''),
          dir(null),
          title('')
        ]), '')).toMatch(/^<html><head><\/head>/)
      })
    })
  })
})
