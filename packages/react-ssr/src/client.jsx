import { hydrateRoot } from 'react-dom/client'
import { InjectionContextProvider } from '@nano_kit/react'
import { App } from '@nano_kit/react-router'
import {
  ROOT_ID,
  ready
} from '@nano_kit/react-ssr/client'
import {
  routes,
  pages
} from 'virtual:app-index'

void ready({
  routes,
  pages
}).then((context) => {
  hydrateRoot(document.getElementById(ROOT_ID), (
    <InjectionContextProvider context={context}>
      <App />
    </InjectionContextProvider>
  ))
})
