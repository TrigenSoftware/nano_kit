import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { api } from './index.js'

const DEFAULT_API_PORT = 3001
const API_PORT = Number(process.env.PORT || DEFAULT_API_PORT)
const app = new Hono()

app.use(compress())
app.use('/api/*', api())

app.get('/', c => c.text('Event Board API is running.'))

serve({
  fetch: app.fetch,
  port: API_PORT
}, (info) => {
  console.info(`event board api started at http://localhost:${info.port}`)
})
