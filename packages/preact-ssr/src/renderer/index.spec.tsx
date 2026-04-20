import {
  describe,
  it,
  expect
} from 'vitest'
import { renderer } from '../../test/app/renderer.jsx'

renderer.manifest = {
  '_layout-CsHmUlQH.js': {
    file: 'assets/layout-CsHmUlQH.js',
    name: 'layout',
    imports: [
      'app/client.jsx'
    ]
  },
  'app/about.jsx': {
    file: 'assets/about-dfrNsiL9.js',
    name: 'about',
    src: 'app/about.jsx',
    isDynamicEntry: true,
    imports: [
      '_layout-CsHmUlQH.js',
      'app/client.jsx'
    ]
  },
  'app/client.jsx': {
    file: 'assets/client-Dfg_FsOr.js',
    name: 'client',
    src: 'app/client.jsx',
    isEntry: true,
    dynamicImports: [
      'app/home.jsx',
      'app/about.jsx'
    ]
  },
  'app/home.jsx': {
    file: 'assets/home-yocNkO-H.js',
    name: 'home',
    src: 'app/home.jsx',
    isDynamicEntry: true,
    imports: [
      '_layout-CsHmUlQH.js',
      'app/client.jsx'
    ]
  }
}

describe('preact-ssr', () => {
  describe('renderer', () => {
    it('should render html', async () => {
      expect((await renderer.render('/')).html).toBe('<!doctype html><html><head><title>Home Page</title><meta charset="utf-8" /><script type="module" src="/assets/client-Dfg_FsOr.js" /></script></head><body><div id="app"><main><div>Home John Doe</div></main></div><script>window.__DEHYDRATED__=[["data",{"user":"John Doe"}]]</script></body></html>')

      expect((await renderer.render('/about')).html).toBe('<!doctype html><html><head><title>About Page</title><meta charset="utf-8" /><script type="module" src="/assets/client-Dfg_FsOr.js" /></script></head><body><div id="app"><main><div>About Miguel loves cheese</div></main></div><script>window.__DEHYDRATED__=[["data",{"info":"Miguel loves cheese"}]]</script></body></html>')
    })
  })
})
