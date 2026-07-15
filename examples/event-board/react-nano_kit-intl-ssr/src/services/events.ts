import {
  Injectable$,
  inject
} from '@nano_kit/store'
import type {
  BoardEvent,
  EventsFilter,
  EventsPage,
  NewEventForm
} from './events.types'
import {
  ApiService$,
  HttpStatus
} from './api'

export * from './events.types'

export class EventsService$ extends Injectable$ {
  api = inject(ApiService$)

  /**
   * Fetch a cursor-paginated page of events.
   * @param filter - Search, category, cursor, and limit filters.
   * @returns Events page with optional next cursor.
   */
  async fetchEvents(filter: EventsFilter = {}) {
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

    const response = await this.api.fetch(`events?${params}`)

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
  async fetchEvent(slug: string) {
    const response = await this.api.fetch(`events/${slug}`)

    if (response.status === HttpStatus.NotFound) {
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
  async createEvent(event: NewEventForm) {
    const response = await this.api.fetch('events', {
      method: 'POST',
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
  async rsvpEvent(id: string) {
    const response = await this.api.fetch(`events/${id}/rsvp`, {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error(response.statusText || `Request failed with status ${response.status}`)
    }

    return await response.json() as BoardEvent
  }
}
