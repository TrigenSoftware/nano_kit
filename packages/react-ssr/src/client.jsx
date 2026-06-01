import { hydrateRoot } from 'react-dom/client'
import { InjectorProvider } from '@nano_kit/react'
import { App } from '@nano_kit/react-router'
import {
  ROOT_ID,
  ready
} from '@nano_kit/react-ssr/client'
import {
  routes,
  pages
} from 'virtual:app-index'

ready({
  routes,
  pages
}).then((injector) => {
  hydrateRoot(document.getElementById(ROOT_ID), (
    <InjectorProvider injector={injector}>
      <App />
    </InjectorProvider>
  ))
})
