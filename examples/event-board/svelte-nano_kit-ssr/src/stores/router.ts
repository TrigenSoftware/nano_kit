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
  newEvent: '/events/new',
  event: '/events/:slug'
} as const

export function Params$() {
  const $location = inject(Location$)
  const $searchParams = searchParams($location)
  const $slug = param($location, 'slug')
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
