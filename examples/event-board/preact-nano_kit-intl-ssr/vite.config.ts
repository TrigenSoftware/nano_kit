import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import ssr from '@nano_kit/preact-ssr/vite-plugin'
import { getRequestListener } from '@hono/node-server'
import { api } from './api/index.js'

export default defineConfig(({ command }) => ({
  build: {
    target: 'esnext'
  },
  ssr: {
    noExternal: command === 'build' || undefined
  },
  plugins: [
    {
      name: 'event-board-api',
      configureServer(server) {
        const listener = getRequestListener(api().fetch)

        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/api')) {
            next()

            return
          }

          listener(req, res).catch(next)
        })
      }
    },
    preact(),
    ssr({
      index: 'src/index.tsx',
      server: 'src/server.ts',
      inject: {
        cookieStore: true,
        browserLocale: true
      }
    })
  ]
}))
