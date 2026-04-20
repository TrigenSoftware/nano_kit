import { type ComponentChildren } from 'preact'

export type PageComponent = (props?: unknown) => ComponentChildren

declare module '@nano_kit/router' {
  interface AppContext {
    component: PageComponent
  }
}
