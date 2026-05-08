import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import ssr from '@nano_kit/svelte-ssr/vite-plugin'
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
    svelte(),
    ssr({
      index: 'src/index.ts'
    })
  ]
})
