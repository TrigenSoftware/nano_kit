/**
 * Event categories supported by the mock API.
 */
export const eventCategories = [
  'conference',
  'meetup',
  'workshop',
  'webinar'
]

const DEFAULT_LIMIT = 3
const MAX_LIMIT = 20
const events = [
  {
    id: '1',
    slug: 'react-ssr-workshop',
    title: 'React SSR Workshop',
    description: 'A hands-on workshop about server rendering, hydration, and app architecture.',
    startsAt: new Date('2026-05-12T18:00:00Z').getTime(),
    location: 'Online',
    category: 'workshop',
    attendees: 24
  },
  {
    id: '2',
    slug: 'frontend-meetup-spring',
    title: 'Frontend Meetup: Spring Edition',
    description: 'Short talks about modern frontend tooling, routing, and state management.',
    startsAt: new Date('2026-05-21T19:30:00Z').getTime(),
    location: 'Berlin',
    category: 'meetup',
    attendees: 58
  },
  {
    id: '3',
    slug: 'state-management-webinar',
    title: 'State Management Webinar',
    description: 'A practical session on signals, derived state, and data fetching.',
    startsAt: new Date('2026-06-03T17:00:00Z').getTime(),
    location: 'Online',
    category: 'webinar',
    attendees: 102
  },
  {
    id: '4',
    slug: 'vite-plugin-night',
    title: 'Vite Plugin Night',
    description: 'A meetup about Vite plugins, build pipelines, and developer experience.',
    startsAt: new Date('2026-06-11T18:30:00Z').getTime(),
    location: 'Prague',
    category: 'meetup',
    attendees: 41
  },
  {
    id: '5',
    slug: 'web-platform-conference',
    title: 'Web Platform Conference',
    description: 'A one-day conference about browser APIs, performance, and modern web apps.',
    startsAt: new Date('2026-06-24T09:00:00Z').getTime(),
    location: 'Amsterdam',
    category: 'conference',
    attendees: 180
  },
  {
    id: '6',
    slug: 'hydration-deep-dive',
    title: 'Hydration Deep Dive',
    description: 'A technical webinar about SSR, RSC, cache hydration, and client handoff.',
    startsAt: new Date('2026-07-02T16:00:00Z').getTime(),
    location: 'Online',
    category: 'webinar',
    attendees: 76
  }
]

function normalizeLimit(value) {
  const limit = Number(value || DEFAULT_LIMIT)

  if (!Number.isFinite(limit) || limit < 1) {
    return DEFAULT_LIMIT
  }

  return Math.min(limit, MAX_LIMIT)
}

function normalizeCategory(value) {
  if (!value) {
    return null
  }

  return eventCategories.includes(value) ? value : undefined
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function uniqueSlug(title) {
  const base = slugify(title) || 'event'
  let slug = base
  let index = 2

  while (findEvent(slug)) {
    slug = `${base}-${index}`
    index += 1
  }

  return slug
}

function sortEvents(items) {
  return [...items].sort((a, b) => a.startsAt - b.startsAt || a.id.localeCompare(b.id))
}

function validateEventInput(input) {
  const errors = {}

  if (!input || typeof input !== 'object') {
    return {
      form: 'Expected event payload'
    }
  }

  if (typeof input.title !== 'string' || !input.title.trim()) {
    errors.title = 'Title is required'
  }

  if (typeof input.description !== 'string' || !input.description.trim()) {
    errors.description = 'Description is required'
  }

  if (typeof input.startsAt !== 'number' || !Number.isFinite(input.startsAt)) {
    errors.startsAt = 'Date and time are required'
  }

  if (typeof input.location !== 'string' || !input.location.trim()) {
    errors.location = 'Location is required'
  }

  if (!eventCategories.includes(input.category)) {
    errors.category = 'Category is invalid'
  }

  return errors
}

/**
 * Return a filtered and cursor-paginated page of events.
 * @param {object} query - Query values from the HTTP request.
 * @param {string | undefined} query.q - Search text.
 * @param {string | undefined} query.category - Category filter.
 * @param {string | undefined} query.cursor - Anchor cursor based on `startsAt`.
 * @param {string | undefined} query.limit - Page size.
 * @returns {{ status: number, body: { events: object[], nextCursor?: number } | { error: string } }} API response payload.
 */
export function listEvents(query) {
  const q = query.q?.trim().toLowerCase()
  const category = normalizeCategory(query.category)
  const cursor = Number(query.cursor || 0)
  const limit = normalizeLimit(query.limit)

  if (category === undefined) {
    return {
      status: 400,
      body: {
        error: 'Unknown event category'
      }
    }
  }

  const filtered = sortEvents(events).filter((event) => {
    if (category && event.category !== category) {
      return false
    }

    if (Number.isFinite(cursor) && cursor > 0 && event.startsAt <= cursor) {
      return false
    }

    if (!q) {
      return true
    }

    return `${event.title} ${event.description} ${event.location}`.toLowerCase().includes(q)
  })
  const pageItems = filtered.slice(0, limit)
  const hasMore = filtered.length > pageItems.length

  return {
    status: 200,
    body: {
      events: pageItems,
      nextCursor: hasMore ? pageItems[pageItems.length - 1]?.startsAt : undefined
    }
  }
}

/**
 * Find an event by slug.
 * @param {string} slug - Event slug.
 * @returns {object | null} Event object or `null` when it does not exist.
 */
export function findEvent(slug) {
  return events.find(event => event.slug === slug) || null
}

/**
 * Create a new event in the in-memory store.
 * @param {object} input - Event form payload.
 * @returns {{ status: number, body: object }} API response payload.
 */
export function createEvent(input) {
  const errors = validateEventInput(input)

  if (Object.keys(errors).length > 0) {
    return {
      status: 400,
      body: {
        errors
      }
    }
  }

  const event = {
    id: crypto.randomUUID(),
    slug: uniqueSlug(input.title),
    title: input.title.trim(),
    description: input.description.trim(),
    startsAt: input.startsAt,
    location: input.location.trim(),
    category: input.category,
    attendees: 0
  }

  events.push(event)

  return {
    status: 201,
    body: event
  }
}

/**
 * Increment attendees count for an event.
 * @param {string} id - Event id.
 * @returns {object | null} Updated event object or `null` when it does not exist.
 */
export function rsvpEvent(id) {
  const event = events.find(item => item.id === id) || null

  if (!event) {
    return null
  }

  event.attendees += 1

  return event
}
