import { hydrate } from 'preact'
import { InjectorProvider } from '@nano_kit/preact'
import { App } from '@nano_kit/preact-router'
import {
  ROOT_ID,
  ready
} from '@nano_kit/preact-ssr/client'
import {
  routes,
  pages
} from 'virtual:app-index'

ready({
  routes,
  pages
}).then((injector) => {
  hydrate((
    <InjectorProvider injector={injector}>
      <App />
    </InjectorProvider>
  ), document.getElementById(ROOT_ID))
})
