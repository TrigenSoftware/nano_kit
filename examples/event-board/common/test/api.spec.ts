import {
  describe,
  it,
  expect
} from 'vitest'
import { api } from '../api/index.js'

interface ApiUser {
  id: string
  username: string
  name: string
}

interface ApiEvent {
  id: string
  slug: string
  title: string
  author?: string
  attendees: number
  going: boolean
}

const app = api()

function sessionCookie(response: Response) {
  return response.headers.get('set-cookie')?.split(';')[0] ?? ''
}

async function login(username: string, password: string) {
  const response = await app.request('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password
    })
  })

  return {
    response,
    cookie: sessionCookie(response)
  }
}

describe('Event Board API', () => {
  describe('auth', () => {
    it('should login a demo user and set an http-only session cookie', async () => {
      const { response } = await login('ada', 'lovelace')
      const user = await response.json() as ApiUser & {
        password?: string
      }
      const setCookie = response.headers.get('set-cookie') ?? ''

      expect(response.status).toBe(200)
      expect(user).toMatchObject({
        username: 'ada',
        name: 'Ada Lovelace'
      })
      expect(user.password).toBeUndefined()
      expect(setCookie).toMatch(/session=[^;]+/)
      expect(setCookie).toMatch(/HttpOnly/i)
    })

    it('should reject invalid credentials', async () => {
      const { response } = await login('ada', 'wrong-password')

      expect(response.status).toBe(401)
      expect(await response.json()).toEqual({
        error: 'Invalid username or password'
      })
    })

    it('should return the current user for a valid session', async () => {
      const { cookie } = await login('grace', 'hopper')
      const response = await app.request('/api/users/me', {
        headers: {
          Cookie: cookie
        }
      })

      expect(response.status).toBe(200)
      expect(await response.json()).toMatchObject({
        username: 'grace',
        name: 'Grace Hopper'
      })
    })

    it('should respond with 401 to me without a session', async () => {
      const response = await app.request('/api/users/me')

      expect(response.status).toBe(401)
    })

    it('should clear the session on logout', async () => {
      const { cookie } = await login('ada', 'lovelace')
      const logoutResponse = await app.request('/api/auth/logout', {
        method: 'POST',
        headers: {
          Cookie: cookie
        }
      })
      const meResponse = await app.request('/api/users/me', {
        headers: {
          Cookie: cookie
        }
      })

      expect(logoutResponse.status).toBe(200)
      expect(logoutResponse.headers.get('set-cookie')).toMatch(/session=;/)
      expect(meResponse.status).toBe(401)
    })
  })

  describe('events', () => {
    it('should include attendees count and personal going flag in the list', async () => {
      const response = await app.request('/api/events?limit=20')
      const { events } = await response.json() as {
        events: ApiEvent[]
      }

      expect(response.status).toBe(200)
      expect(events.length).toBeGreaterThan(0)

      for (const event of events) {
        expect(typeof event.attendees).toBe('number')
        expect(event.going).toBe(false)
      }
    })

    it('should toggle personal attendance for an authenticated rsvp', async () => {
      const { cookie } = await login('grace', 'hopper')
      const detailsResponse = await app.request('/api/events/vite-plugin-night')
      const event = await detailsResponse.json() as ApiEvent
      const rsvpResponse = await app.request(`/api/events/${event.id}/rsvp`, {
        method: 'POST',
        headers: {
          Cookie: cookie
        }
      })
      const rsvped = await rsvpResponse.json() as ApiEvent
      const secondRsvpResponse = await app.request(`/api/events/${event.id}/rsvp`, {
        method: 'POST',
        headers: {
          Cookie: cookie
        }
      })
      const unrsvped = await secondRsvpResponse.json() as ApiEvent

      expect(rsvped.going).toBe(true)
      expect(rsvped.attendees).toBe(event.attendees + 1)
      expect(unrsvped.going).toBe(false)
      expect(unrsvped.attendees).toBe(event.attendees)
    })

    it('should increment the guest counter for an anonymous rsvp', async () => {
      const detailsResponse = await app.request('/api/events/web-platform-conference')
      const event = await detailsResponse.json() as ApiEvent
      const rsvpResponse = await app.request(`/api/events/${event.id}/rsvp`, {
        method: 'POST'
      })
      const rsvped = await rsvpResponse.json() as ApiEvent

      expect(rsvped.going).toBe(false)
      expect(rsvped.attendees).toBe(event.attendees + 1)
    })

    it('should keep the personal attendance visible in event details', async () => {
      const { cookie } = await login('ada', 'lovelace')
      const detailsResponse = await app.request('/api/events/hydration-deep-dive')
      const event = await detailsResponse.json() as ApiEvent

      await app.request(`/api/events/${event.id}/rsvp`, {
        method: 'POST',
        headers: {
          Cookie: cookie
        }
      })

      const authedResponse = await app.request('/api/events/hydration-deep-dive', {
        headers: {
          Cookie: cookie
        }
      })
      const authedEvent = await authedResponse.json() as ApiEvent
      const anonymousResponse = await app.request('/api/events/hydration-deep-dive')
      const anonymousEvent = await anonymousResponse.json() as ApiEvent

      expect(authedEvent.going).toBe(true)
      expect(authedEvent.attendees).toBe(event.attendees + 1)
      expect(anonymousEvent.going).toBe(false)
      expect(anonymousEvent.attendees).toBe(event.attendees + 1)
    })

    it('should store the author for an event created with a session', async () => {
      const { cookie } = await login('ada', 'lovelace')
      const response = await app.request('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie
        },
        body: JSON.stringify({
          title: 'Authored Event',
          description: 'An event created by a logged in user.',
          startsAt: new Date('2026-08-01T18:00:00Z').getTime(),
          location: 'Online',
          category: 'meetup'
        })
      })
      const event = await response.json() as ApiEvent

      expect(response.status).toBe(201)
      expect(event.author).toBe('Ada Lovelace')
      expect(event.attendees).toBe(0)
      expect(event.going).toBe(false)
    })

    it('should reject event creation without a session', async () => {
      const response = await app.request('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Anonymous Event',
          description: 'An event created without a session.',
          startsAt: new Date('2026-08-02T18:00:00Z').getTime(),
          location: 'Online',
          category: 'webinar'
        })
      })

      expect(response.status).toBe(401)
    })
  })
})
