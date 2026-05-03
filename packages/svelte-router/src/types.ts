import type { Component } from 'svelte'

export type PageComponent = Component<Record<string, never>>

declare module '@nano_kit/router' {
  interface AppContext {
    component: PageComponent
  }
}
