import {
  asModule,
  layout,
  page
} from '@nano_kit/react-router'
import { routes } from './stores/router'
import * as Layout from './ui/pages/Layout'
import * as Home from './ui/pages/Home'
import * as Logout from './ui/pages/Logout'
import './app.css'

declare module '@nano_kit/router' {
  interface AppContext {
    routes: typeof routes
  }
}

export { routes }

export const pages = [
  layout(Layout, [
    page('home', asModule(Home)),
    page('logout', asModule(Logout))
  ])
]
