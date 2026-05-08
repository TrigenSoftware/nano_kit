export const eventCategories = [
  'conference',
  'meetup',
  'workshop',
  'webinar'
] as const

export type EventCategory = typeof eventCategories[number]

export interface BoardEvent {
  id: string
  slug: string
  title: string
  description: string
  startsAt: number
  location: string
  category: EventCategory
  attendees: number
}

export interface EventsPage {
  events: BoardEvent[]
  nextCursor?: number
}

export interface EventsFilter {
  q?: string
  category?: EventCategory | null
  cursor?: number
  limit?: number
}

export interface NewEventForm {
  title: string
  description: string
  startsAt: number | null
  location: string
  category: EventCategory
}
