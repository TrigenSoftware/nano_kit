import { Hono } from 'hono'
import {
  deleteCookie,
  getCookie,
  setCookie
} from 'hono/cookie'
import {
  createEvent,
  findEvent,
  listEvents,
  rsvpEvent
} from './events.js'
import {
  authenticateUser,
  createSession,
  deleteSession,
  findUserBySession,
  publicUser
} from './users.js'

const HTTP_BAD_REQUEST = 400
const HTTP_UNAUTHORIZED = 401
const HTTP_NOT_FOUND = 404
const SESSION_COOKIE = 'session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30

/**
 * Resolve the current user from the request session cookie.
 * @param {import('hono').Context} c
 * @returns {object | null} Session user or `null`.
 */
function currentUser(c) {
  return findUserBySession(getCookie(c, SESSION_COOKIE))
}

export function api() {
  const app = new Hono()

  app.post('/api/auth/login', async (c) => {
    let body

    try {
      body = await c.req.json()
    } catch {
      return c.json({
        error: 'Expected JSON payload'
      }, HTTP_BAD_REQUEST)
    }

    const user = authenticateUser(body?.username, body?.password)

    if (!user) {
      return c.json({
        error: 'Invalid username or password'
      }, HTTP_UNAUTHORIZED)
    }

    setCookie(c, SESSION_COOKIE, createSession(user.id), {
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: SESSION_MAX_AGE
    })

    return c.json(publicUser(user))
  })

  app.post('/api/auth/logout', (c) => {
    const token = getCookie(c, SESSION_COOKIE)

    if (token) {
      deleteSession(token)
    }

    deleteCookie(c, SESSION_COOKIE, {
      path: '/'
    })

    return c.json({
      ok: true
    })
  })

  app.get('/api/users/me', (c) => {
    const user = currentUser(c)

    if (!user) {
      return c.json({
        error: 'Unauthenticated'
      }, HTTP_UNAUTHORIZED)
    }

    return c.json(publicUser(user))
  })

  app.get('/api/events', (c) => {
    const user = currentUser(c)
    const result = listEvents({
      q: c.req.query('q'),
      category: c.req.query('category'),
      cursor: c.req.query('cursor'),
      limit: c.req.query('limit')
    }, user?.id)

    return c.json(result.body, result.status)
  })

  app.get('/api/events/:slug', (c) => {
    const user = currentUser(c)
    const event = findEvent(c.req.param('slug'), user?.id)

    if (!event) {
      return c.json(null, HTTP_NOT_FOUND)
    }

    return c.json(event)
  })

  app.post('/api/events', async (c) => {
    const user = currentUser(c)

    if (!user) {
      return c.json({
        error: 'Unauthenticated'
      }, HTTP_UNAUTHORIZED)
    }

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

    const result = createEvent(body, user)

    return c.json(result.body, result.status)
  })

  app.post('/api/events/:id/rsvp', (c) => {
    const user = currentUser(c)
    const event = rsvpEvent(c.req.param('id'), user?.id)

    if (!event) {
      return c.json(null, HTTP_NOT_FOUND)
    }

    return c.json(event)
  })

  return app
}
