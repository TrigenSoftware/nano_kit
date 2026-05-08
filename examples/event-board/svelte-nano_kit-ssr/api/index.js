import { Hono } from 'hono'
import {
  createEvent,
  findEvent,
  listEvents,
  rsvpEvent
} from './events.js'

const HTTP_BAD_REQUEST = 400
const HTTP_NOT_FOUND = 404

export function createApiApp() {
  const app = new Hono()

  app.get('/api/events', (c) => {
    const result = listEvents({
      q: c.req.query('q'),
      category: c.req.query('category'),
      cursor: c.req.query('cursor'),
      limit: c.req.query('limit')
    })

    return c.json(result.body, result.status)
  })

  app.get('/api/events/:slug', (c) => {
    const event = findEvent(c.req.param('slug'))

    if (!event) {
      return c.json(null, HTTP_NOT_FOUND)
    }

    return c.json(event)
  })

  app.post('/api/events', async (c) => {
    let body

    try {
      body = await c.req.json()
    } catch {
      return c.json({
        errors: {
          form: 'Expected JSON payload'
        }
      }, HTTP_BAD_REQUEST)
    }

    const result = createEvent(body)

    return c.json(result.body, result.status)
  })

  app.post('/api/events/:id/rsvp', (c) => {
    const event = rsvpEvent(c.req.param('id'))

    if (!event) {
      return c.json(null, HTTP_NOT_FOUND)
    }

    return c.json(event)
  })

  return app
}

export function api() {
  const app = createApiApp()

  return c => app.fetch(c.req.raw)
}
