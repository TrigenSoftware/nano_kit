import {
  action,
  computed,
  debounce,
  inject,
  not,
  pace,
  signal
} from '@nano_kit/store'
import {
  Navigation$,
  Paths$
} from '@nano_kit/router'
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
  fetchEvent,
  fetchEvents,
  rsvpEvent
} from '#src/services/events'
import { Params$ } from './router'
import { Client$ } from './query'
import { datetimeLocalValue } from './utils'

const SEARCH_DEBOUNCE = 600
const MOCK_EVENT_START = new Date('2026-05-01T18:00:00Z').getTime()

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
      entities((capture, data) => ({
        ...data,
        pages: data.pages.map(page => ({
          ...page,
          events: page.events.map(capture(EventEntity))
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

export function NewEventForm$() {
  const {
    mutation,
    revalidate
  } = inject(Client$)
  const navigation = inject(Navigation$)
  const paths = inject(Paths$)
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
    $startsAt(datetimeLocalValue(MOCK_EVENT_START))
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

      onSuccess(ctx, (created) => {
        revalidate(EventsKey)
        reset()
        navigation.push(paths.event({
          slug: created.slug
        }))
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
        $data(key, {
          ...previousEvent,
          attendees: previousEvent.attendees + 1
        })

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
