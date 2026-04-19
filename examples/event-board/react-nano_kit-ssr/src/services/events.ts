import type {
  BoardEvent,
  EventCategory,
  EventsFilter,
  EventsPage,
  NewEventForm
} from './events.types'

export * from './events.types'

/**
 * Absolute API origin used by the server renderer.
 * Browser requests stay relative to the current origin.
 */
const API_ORIGIN = import.meta.env.SSR
  ? import.meta.env.VITE_EVENT_BOARD_API_ORIGIN || (import.meta.env.DEV ? 'http://localhost:5173' : 'http://localhost:3001')
  : ''
const HTTP_NOT_FOUND = 404

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function eventMatches(
  event: BoardEvent,
  filter: {
    q?: string
    category?: EventCategory | null
  }
) {
  const search = filter.q?.trim().toLowerCase()

  if (filter.category && event.category !== filter.category) {
    return false
  }

  if (!search) {
    return true
  }

  return `${event.title} ${event.description} ${event.location}`.toLowerCase().includes(search)
}

export function optimisticEvent(
  id: string,
  event: NewEventForm
): BoardEvent {
  return {
    id,
    slug: slugify(event.title) || id,
    title: event.title,
    description: event.description,
    startsAt: event.startsAt ?? Date.now(),
    location: event.location,
    category: event.category,
    attendees: 0
  }
}

/**
 * Fetch a cursor-paginated page of events.
 * @param filter - Search, category, cursor, and limit filters.
 * @returns Events page with optional next cursor.
 */
export async function fetchEvents(filter: EventsFilter = {}) {
  const params = new URLSearchParams()

  if (filter.q) {
    params.set('q', filter.q)
  }

  if (filter.category) {
    params.set('category', filter.category)
  }

  if (filter.cursor) {
    params.set('cursor', String(filter.cursor))
  }

  if (filter.limit) {
    params.set('limit', String(filter.limit))
  }

  const response = await fetch(`${API_ORIGIN}/api/events?${params}`)

  if (!response.ok) {
    throw new Error(response.statusText || `Request failed with status ${response.status}`)
  }

  return await response.json() as EventsPage
}

/**
 * Fetch a single event by slug.
 * @param slug - Event slug from the route.
 * @returns Event details, or `null` when the event does not exist.
 */
export async function fetchEvent(slug: string) {
  const response = await fetch(`${API_ORIGIN}/api/events/${slug}`)

  if (response.status === HTTP_NOT_FOUND) {
    return null
  }

  if (!response.ok) {
    throw new Error(response.statusText || `Request failed with status ${response.status}`)
  }

  return await response.json() as BoardEvent
}

/**
 * Create a new event in the mock API.
 * @param event - New event form payload.
 * @returns Created event with generated id, slug, and attendees count.
 */
export async function createEvent(event: NewEventForm) {
  const response = await fetch(`${API_ORIGIN}/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  })

  if (!response.ok) {
    throw new Error(response.statusText || `Request failed with status ${response.status}`)
  }

  return await response.json() as BoardEvent
}

/**
 * Mark the current user as going to an event.
 * @param id - Event id.
 * @returns Updated event with incremented attendees count.
 */
export async function rsvpEvent(id: string) {
  const response = await fetch(`${API_ORIGIN}/api/events/${id}/rsvp`, {
    method: 'POST'
  })

  if (!response.ok) {
    throw new Error(response.statusText || `Request failed with status ${response.status}`)
  }

  return await response.json() as BoardEvent
}
