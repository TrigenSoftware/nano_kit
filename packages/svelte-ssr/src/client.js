import { hydrate } from 'svelte'
import { setInjectionContext } from '@nano_kit/svelte'
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
}).then((context) => {
  hydrate((internals, props) => {
    setInjectionContext(context)

    return App(internals, props)
  }, {
    target: document.getElementById(ROOT_ID)
  })
})
