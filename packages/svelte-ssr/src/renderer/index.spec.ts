import {
  describe,
  it,
  expect
} from 'vitest'
import { renderer } from '../../test/app/renderer.js'

renderer.manifest = {
  '_layout-CsHmUlQH.js': {
    file: 'assets/layout-CsHmUlQH.js',
    name: 'layout',
    imports: [
      'app/client.js'
    ]
  },
  'app/about.svelte': {
    file: 'assets/about-dfrNsiL9.js',
    name: 'about',
    src: 'app/about.svelte',
    isDynamicEntry: true,
    imports: [
      '_layout-CsHmUlQH.js',
      'app/client.js'
    ]
  },
  'app/client.js': {
    file: 'assets/client-Dfg_FsOr.js',
    name: 'client',
    src: 'app/client.js',
    isEntry: true,
    dynamicImports: [
      'app/home.svelte',
      'app/about.svelte'
    ]
  },
  'app/home.svelte': {
    file: 'assets/home-yocNkO-H.js',
    name: 'home',
    src: 'app/home.svelte',
    isDynamicEntry: true,
    imports: [
      '_layout-CsHmUlQH.js',
      'app/client.js'
    ]
  }
}

describe('svelte-ssr', () => {
  describe('renderer', () => {
    it('should render html', async () => {
      expect((await renderer.render('/')).html).toBe('<!doctype html><html><head><title>Home Page</title><meta charset="utf-8" /><script type="module" src="/assets/client-Dfg_FsOr.js" /></script></head><body><div id="app"><!--[--><!--[0--><!--[--><main><!--[0--><!--[--><div>Home John Doe</div><!--]--><!--]--><!----></main><!--]--><!--]--><!--]--></div><script>window.__DEHYDRATED__=[["data",{"user":"John Doe"}]]</script></body></html>')

      expect((await renderer.render('/about')).html).toBe('<!doctype html><html><head><title>About Page</title><meta charset="utf-8" /><script type="module" src="/assets/client-Dfg_FsOr.js" /></script></head><body><div id="app"><!--[--><!--[0--><!--[--><main><!--[0--><!--[--><div>About Miguel loves cheese</div><!--]--><!--]--><!----></main><!--]--><!--]--><!--]--></div><script>window.__DEHYDRATED__=[["data",{"info":"Miguel loves cheese"}]]</script></body></html>')
    })
  })
})
