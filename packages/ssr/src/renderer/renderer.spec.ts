import {
  describe,
  it,
  expect
} from 'vitest'
import { renderer } from '../../test/app/renderer.js'

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

describe('ssr', () => {
  describe('renderer', () => {
    it('should render html', async () => {
      expect((await renderer.render('/')).html).toBe(
        '<!doctype html><title>Home Page</title><meta charset="utf-8" /><script type="module" src="/assets/client-Dfg_FsOr.js" /></script><script>window.__DEHYDRATED__=[["data",{"user":"John Doe"}]]</script>Layout > Home John Doe'
      )

      expect((await renderer.render('/about')).html).toBe(
        '<!doctype html><title>About Page</title><meta charset="utf-8" /><script type="module" src="/assets/client-Dfg_FsOr.js" /></script><script>window.__DEHYDRATED__=[["data",{"info":"Miguel loves cheese"}]]</script>Layout > About Miguel loves cheese'
      )
    })

    it('should escape closing script tags in the dehydrated script', () => {
      expect(renderer.dehydratedScript([
        ['html', '</script><script>alert(1)</script>']
      ])).toBe('window.__DEHYDRATED__=[["html","\\u003c/script>\\u003cscript>alert(1)\\u003c/script>"]]')
    })
  })
})
