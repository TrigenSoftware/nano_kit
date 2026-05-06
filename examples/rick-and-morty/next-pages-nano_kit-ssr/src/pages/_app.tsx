import type { AppProps } from 'next/app'
import { HydrationProvider } from '@nano_kit/react'
import { NextNavigationProvider } from '@nano_kit/next-router'
import { routes } from '@/stores/router'
import { Header } from '@/ui/blocks/Header'
import '@/styles/globals.css'

declare module '@nano_kit/router' {
  interface AppContext {
    routes: typeof routes
  }
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextNavigationProvider routes={routes}>
      <HydrationProvider dehydrated={pageProps.dehydrated}>
        <div className='layout-app'>
          <Header />
          <main className='layout-main'>
            <Component {...pageProps} />
          </main>
        </div>
      </HydrationProvider>
    </NextNavigationProvider>
  )
}
