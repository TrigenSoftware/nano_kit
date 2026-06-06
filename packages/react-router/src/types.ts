import type { ReactNode } from 'react'

export type PageComponent = (props?: unknown) => ReactNode

declare module '@nano_kit/router' {
  interface AppContext {
    component: PageComponent
  }
}
