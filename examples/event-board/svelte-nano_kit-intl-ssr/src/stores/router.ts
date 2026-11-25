import { inject } from '@nano_kit/store'
import {
  Location$,
  param,
  searchParam,
  searchParams
} from '@nano_kit/router'
import {
  type EventCategory,
  eventCategories
} from '#src/services/events'

export const routes = {
  home: '/',
  login: '/login',
  newEvent: '/events/new',
  event: '/events/:slug'
} as const

export const publicRoutes = new Set<string>([
  'home',
  'login',
  'event'
])

// The slug goes into the path of an API request, and the router decodes `%2F` in it to `/`:
// a slug of anything but letters, digits and dashes is no slug at all
function parseSlug(slug: string | undefined) {
  return slug && /^[\w-]+$/.test(slug)
    ? slug
    : ''
}

export function Params$() {
  const $location = inject(Location$)
  const $searchParams = searchParams($location)
  const $slug = param($location, 'slug', parseSlug)
  const $q = searchParam($searchParams, 'q', value => value || '')
  const $category = searchParam($searchParams, 'category', (value): EventCategory | null => (
    eventCategories.includes(value as EventCategory)
      ? value as EventCategory
      : null
  ))

  return {
    $slug,
    $q,
    $category,
    $searchParams
  }
}
