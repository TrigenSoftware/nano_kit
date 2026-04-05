import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { compress } from 'hono/compress'
import { Hono } from 'hono'
// eslint-disable-next-line import/no-useless-path-segments
import { renderer } from './dist/renderer/index.js'

const app = new Hono()

app.use(compress())
app.use(`${renderer.base.replace(/(.)\/$/, '$1')}*`, serveStatic({
  root: './dist/client',
  onFound: (_, c) => {
    c.header('Cache-Control', 'public, immutable, max-age=31536000')
  }
}))

app.get('*', async (c) => {
  const url = c.req.url

  console.log(`handling ${url}`)

  const started = Date.now()
  const result = await renderer.render(url)

  if (result.redirect) {
    console.log(`redirecting ${url} to ${result.redirect} with status ${result.statusCode} in ${Date.now() - started}ms`)

    return c.redirect(result.redirect, result.statusCode)
  }

  if (result.html !== null) {
    console.log(`rendered ${url} in ${Date.now() - started}ms`)

    return c.html(result.html, result.statusCode)
  }

  console.log(`route ${url} not found`)

  return c.text('Not Found', result.statusCode)
})

serve({
  fetch: app.fetch,
  port: 5173
}, (info) => {
  console.log(`server started at http://localhost:${info.port}`)
})
