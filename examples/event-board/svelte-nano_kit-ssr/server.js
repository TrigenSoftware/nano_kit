import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { renderer } from './dist/renderer/index.js'
import { api } from './api/index.js'

const DEFAULT_PORT = 3001
const CACHE_MAX_AGE = 31_536_000
const PORT = Number(process.env.PORT || DEFAULT_PORT)
const app = new Hono()

app.use(compress())
app.use('/api/*', api())

app.use(`${renderer.base.replace(/(.)\/$/, '$1')}*`, serveStatic({
  root: './dist/client',
  onFound: (_, c) => {
    c.header('Cache-Control', `public, immutable, max-age=${CACHE_MAX_AGE}`)
  }
}))

app.get('*', async (c) => {
  const result = await renderer.render(c.req.url)

  if (result.redirect) {
    return c.redirect(result.redirect, result.statusCode)
  }

  if (result.html !== null) {
    return c.html(result.html, result.statusCode)
  }

  return c.text('Not Found', result.statusCode)
})

serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.info(`event board server started at http://localhost:${info.port}`)
})
