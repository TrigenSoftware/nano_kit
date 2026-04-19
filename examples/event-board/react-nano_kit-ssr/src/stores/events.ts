import {
  action,
  computed,
  debounce,
  inject,
  not,
  pace,
  signal
} from '@nano_kit/store'
import { Navigation$ } from '@nano_kit/router'
import {
  type InfinitePages,
  disabled,
  entities,
  entity,
  onError,
  onSuccess,
  queryKey
} from '@nano_kit/query'
import {
  type BoardEvent,
  type EventCategory,
  type EventsPage,
  type NewEventForm,
  createEvent,
  eventMatches,
  fetchEvent,
  fetchEvents,
  optimisticEvent,
  rsvpEvent
} from '#src/services/events'
import { Params$ } from './router'
import { Client$ } from './query'
import {
  datetimeLocalValue,
  optimisticId
} from './utils'

const SEARCH_DEBOUNCE = 600
const MOCK_EVENT_START_OFFSET = 14 * 24 * 60 * 60 * 1000

export interface EventsList extends InfinitePages<EventsPage, number> {
  q?: string
  category?: EventCategory | null
}

export const EventsKey = queryKey<[q: string, category: EventCategory | null], EventsList>('events')

export const EventKey = queryKey<[slug: string | undefined], BoardEvent | null>('event')

export const EventEntity = entity<BoardEvent>('event')

export function EventsList$() {
  const {
    $data,
    infinite
  } = inject(Client$)
  const {
    $q,
    $category
  } = inject(Params$)
  const $pacedQ = computed(pace($q, debounce(SEARCH_DEBOUNCE)))
  const [
    fetchNext,
    $events,
    $eventsError,
    $eventsLoading
  ] = infinite(
    EventsKey,
    [$pacedQ, $category],
    lastPage => lastPage.nextCursor,
    (q, category, cursor, ctx) => {
      onSuccess(ctx, () => {
        $data(ctx, data => data && {
          ...data,
          q,
          category
        })
      })

      return fetchEvents({
        cursor,
        q,
        category
      })
    },
    [
      entities(data => ({
        ...data,
        pages: data.pages.map(page => ({
          ...page,
          events: page.events.map(EventEntity)
        }))
      }))
    ]
  )

  return {
    fetchNext,
    $events,
    $eventsError,
    $eventsLoading
  }
}

export function EventDetails$() {
  const { query } = inject(Client$)
  const { $slug } = inject(Params$)
  const [
    $event,
    $eventError,
    $eventLoading
  ] = query(
    EventKey,
    [$slug],
    async slug => (
      slug
        ? await fetchEvent(slug)
        : null
    ),
    [entities(EventEntity)]
  )

  return {
    $event,
    $eventError,
    $eventLoading
  }
}

function addEvent(
  data: EventsList | null,
  id: string,
  payload: NewEventForm
) {
  const event = optimisticEvent(id, payload)

  if (!data || !eventMatches(event, data)) {
    return data
  }

  if (data.pages.length === 0) {
    return {
      ...data,
      pages: [{
        events: [event]
      }],
      next: undefined,
      more: false
    }
  }

  const [firstPage, ...restPages] = data.pages

  return {
    ...data,
    pages: [
      {
        ...firstPage,
        events: [
          event,
          ...firstPage.events
        ]
      },
      ...restPages
    ]
  }
}

function replaceEvent(
  data: EventsList | null,
  id: string,
  event: BoardEvent
) {
  if (!data) {
    return data
  }

  return {
    ...data,
    pages: data.pages.map(page => ({
      ...page,
      events: page.events.map(item => (
        item.id === id
          ? event
          : item
      ))
    }))
  }
}

function removeEvent(
  data: EventsList | null,
  id: string
) {
  if (!data) {
    return data
  }

  return {
    ...data,
    pages: data.pages.map(page => ({
      ...page,
      events: page.events.filter(event => event.id !== id)
    }))
  }
}

export function NewEventForm$() {
  const {
    $data,
    mutation
  } = inject(Client$)
  const navigation = inject(Navigation$)
  const $title = signal('')
  const $description = signal('')
  const $startsAt = signal('')
  const $location = signal('')
  const $category = signal<EventCategory>('meetup')
  const $errors = computed(() => {
    const errors: Partial<Record<keyof NewEventForm, string>> = {}

    if (!$title().trim()) {
      errors.title = 'Title is required'
    }

    if (!$description().trim()) {
      errors.description = 'Description is required'
    }

    if (!$startsAt()) {
      errors.startsAt = 'Date and time are required'
    }

    if (!$location().trim()) {
      errors.location = 'Location is required'
    }

    return errors
  })
  const $valid = computed(() => Object.keys($errors()).length === 0)
  const $payload = computed(() => ({
    title: $title().trim(),
    description: $description().trim(),
    startsAt: new Date($startsAt()).getTime(),
    location: $location().trim(),
    category: $category()
  }))
  const reset = action(() => {
    $title('')
    $description('')
    $startsAt('')
    $location('')
    $category('meetup')
  })
  const fillMock = action(() => {
    $title('Frontend Architecture Night')
    $description('Short talks about SSR, routing, query caching, and pragmatic app architecture.')
    $startsAt(datetimeLocalValue(Date.now() + MOCK_EVENT_START_OFFSET))
    $location('Online')
    $category('meetup')
  })
  const [
    submit,
    $createdEvent,
    $createError,
    $createLoading
  ] = mutation<[], BoardEvent>(
    (ctx) => {
      const payload = $payload()
      const oid = optimisticId()

      $data(EventsKey, data => addEvent(data, oid, payload))

      onSuccess(ctx, (created) => {
        $data(EventsKey, data => replaceEvent(data, oid, created))
        reset()
        navigation.push(`/events/${created.slug}`)
      })
      onError(ctx, () => {
        $data(EventsKey, data => removeEvent(data, oid))
      })

      return createEvent(payload)
    },
    [
      disabled(not($valid)),
      entities(EventEntity)
    ]
  )

  return {
    $title,
    $description,
    $startsAt,
    $location,
    $category,
    $errors,
    $valid,
    $createdEvent,
    $createError,
    $createLoading,
    fillMock,
    submit,
    reset
  }
}

function changeAttendees(
  event: BoardEvent,
  value: number
) {
  return {
    ...event,
    attendees: Math.max(0, event.attendees + value)
  }
}

export function RsvpEvent$() {
  const {
    $data,
    mutation
  } = inject(Client$)
  const [
    rsvp,
    $rsvpEvent,
    $rsvpError,
    $rsvpLoading
  ] = mutation<[id: string], BoardEvent>(
    (id, ctx) => {
      const key = EventEntity(id)
      const previousEvent = $data(key)

      if (previousEvent) {
        $data(key, changeAttendees(previousEvent, 1))

        onError(ctx, () => {
          $data(key, previousEvent)
        })
      }

      return rsvpEvent(id)
    }
  )

  return {
    rsvp,
    $rsvpEvent,
    $rsvpError,
    $rsvpLoading
  }
}
