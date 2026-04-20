import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import ssr from '@nano_kit/preact-ssr/vite-plugin'
import { getRequestListener } from '@hono/node-server'
import { createApiApp } from './api/index.js'

export default defineConfig({
  build: {
    target: 'esnext'
  },
  plugins: [
    {
      name: 'event-board-api',
      configureServer(server) {
        const listener = getRequestListener(createApiApp().fetch)

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
      index: 'src/index.tsx'
    })
  ]
})
