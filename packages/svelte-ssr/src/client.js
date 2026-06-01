import { hydrate } from 'svelte'
import { setInjector } from '@nano_kit/svelte'
import { App } from '@nano_kit/svelte-router'
import {
  ROOT_ID,
  ready
} from '@nano_kit/svelte-ssr/client'
import {
  routes,
  pages
} from 'virtual:app-index'

ready({
  routes,
  pages
}).then((injector) => {
  hydrate((internals, props) => {
    setInjector(injector)

    return App(internals, props)
  }, {
    target: document.getElementById(ROOT_ID)
  })
})
