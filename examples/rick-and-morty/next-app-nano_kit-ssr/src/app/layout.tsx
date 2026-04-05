import type { Metadata } from 'next'
import { FlightDetector } from '@nano_kit/react'
import { NextNavigation } from '@nano_kit/next-router'
import { routes } from '@/stores/router'
import { Header } from '@/ui/blocks/Header'
import styles from './layout.module.css'
import './globals.css'

declare module '@nano_kit/router' {
  interface AppContext {
    routes: typeof routes
  }
}

export const metadata: Metadata = {
  title: 'Rick and Morty Wiki'
}

export default function RootLayout({ children }: {
  children: React.ReactNode
}) {
  return (
    <FlightDetector>
      <NextNavigation
        routes={routes}
        prerenderable
      >
        <html lang='en'>
          <body>
            <div className={styles.app}>
              <Header />
              <main className={styles.main}>
                {children}
              </main>
            </div>
          </body>
        </html>
      </NextNavigation>
    </FlightDetector>
  )
}
