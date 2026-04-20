import { hydrate } from 'preact'
import { InjectionContextProvider } from '@nano_kit/preact'
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
}).then((context) => {
  hydrate((
    <InjectionContextProvider context={context}>
      <App />
    </InjectionContextProvider>
  ), document.getElementById(ROOT_ID))
})
