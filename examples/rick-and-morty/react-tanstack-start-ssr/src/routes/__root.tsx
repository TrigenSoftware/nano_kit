import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext
} from '@tanstack/react-router'
import { MainLayout } from '#src/ui/pages/MainLayout'
import appCss from '../app.css?url'

export interface RouterContext {
  queryClient: QueryClient
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0'
      },
      {
        title: 'Rick And Morty Browser'
      }
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss
      }
    ]
  }),
  component: RootComponent
})

export const Route = rootRoute

function RootComponent() {
  return (
    <RootDocument>
      <MainLayout />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang='en'>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
